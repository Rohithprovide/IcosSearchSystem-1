from app.models.config import Config
from app.utils.misc import read_config_bool
from app.utils.rate_limiter import should_rate_limit, record_request, get_rate_limit_delay
from datetime import datetime
from defusedxml import ElementTree as ET
import random
import requests
from requests import Response, ConnectionError
import urllib.parse as urlparse
import os
import time
import hashlib
from stem import Signal, SocketError
from stem.connection import AuthenticationFailure
from stem.control import Controller
from stem.connection import authenticate_cookie, authenticate_password

MAPS_URL = 'https://maps.google.com/maps'
AUTOCOMPLETE_URL = ('https://suggestqueries.google.com/'
                    'complete/search?client=toolbar&')

MOBILE_UA = '{}/5.0 (Android 0; Mobile; rv:54.0) Gecko/54.0 {}/59.0'
DESKTOP_UA = '{}/5.0 (X11; {} x86_64; rv:75.0) Gecko/20100101 {}/75.0'

# Enhanced user agents to avoid rate limiting
ENHANCED_USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0'
]

MOBILE_USER_AGENTS = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
]

# Valid query params
VALID_PARAMS = ['tbs', 'tbm', 'start', 'near', 'source', 'nfpr']

# Request tracking for rate limiting
_request_history = {}
_last_request_time = 0


class TorError(Exception):
    """Exception raised for errors in Tor requests.

    Attributes:
        message: a message describing the error that occurred
        disable: optionally disables Tor in the user config (note:
            this should only happen if the connection has been dropped
            altogether).
    """

    def __init__(self, message, disable=False) -> None:
        self.message = message
        self.disable = disable
        super().__init__(message)


def send_tor_signal(signal: Signal) -> bool:
    use_pass = read_config_bool('WHOOGLE_TOR_USE_PASS')

    confloc = './misc/tor/control.conf'
    # Check that the custom location of conf is real.
    temp = os.getenv('WHOOGLE_TOR_CONF', '')
    if os.path.isfile(temp):
        confloc = temp

    # Attempt to authenticate and send signal.
    try:
        with Controller.from_port(port=9051) as c:
            if use_pass:
                with open(confloc, "r") as conf:
                    # Scan for the last line of the file.
                    for line in conf:
                        pass
                    secret = line.strip('\n')
                authenticate_password(c, password=secret)
            else:
                cookie_path = '/var/lib/tor/control_auth_cookie'
                authenticate_cookie(c, cookie_path=cookie_path)
            c.signal(signal)
            os.environ['TOR_AVAILABLE'] = '1'
            return True
    except (SocketError, AuthenticationFailure,
            ConnectionRefusedError, ConnectionError):
        # TODO: Handle Tor authentication (password and cookie)
        os.environ['TOR_AVAILABLE'] = '0'

    return False


def get_enhanced_user_agent(is_mobile=False) -> str:
    """Get a randomized, realistic user agent to avoid detection"""
    if is_mobile:
        return random.choice(MOBILE_USER_AGENTS)
    else:
        return random.choice(ENHANCED_USER_AGENTS)

def add_request_delay():
    """Add delay between requests to avoid rate limiting"""
    global _last_request_time
    current_time = time.time()
    time_since_last = current_time - _last_request_time
    
    # Minimum delay of 1-3 seconds between requests
    min_delay = random.uniform(1.0, 3.0)
    if time_since_last < min_delay:
        delay = min_delay - time_since_last
        time.sleep(delay)
    
    _last_request_time = time.time()

def gen_user_agent(config, is_mobile) -> str:
    # Define the Lynx user agent
    LYNX_UA = 'Lynx/2.9.2 libwww-FM/2.14 SSL-MM/1.4.1 OpenSSL/3.4.0'

    # If using custom user agent, return the custom string
    if config.user_agent == 'custom' and config.custom_user_agent:
        return config.custom_user_agent

    # If using Lynx user agent
    if config.user_agent == 'LYNX_UA':
        return LYNX_UA

    # If no custom user agent is set, generate a random one
    firefox = random.choice(['Choir', 'Squier', 'Higher', 'Wire']) + 'fox'
    linux = random.choice(['Win', 'Sin', 'Gin', 'Fin', 'Kin']) + 'ux'

    if is_mobile:
        return MOBILE_UA.format("Mozilla", firefox)

    return DESKTOP_UA.format("Mozilla", linux, firefox)


def gen_query(query, args, config) -> str:
    param_dict = {key: '' for key in VALID_PARAMS}

    # Use :past(hour/day/week/month/year) if available
    # example search "new restaurants :past month"
    lang = ''
    if ':past' in query and 'tbs' not in args:
        time_range = str.strip(query.split(':past', 1)[-1])
        param_dict['tbs'] = '&tbs=' + ('qdr:' + str.lower(time_range[0]))
    elif 'tbs' in args or 'tbs' in config:
        result_tbs = args.get('tbs') if 'tbs' in args else config['tbs']
        param_dict['tbs'] = '&tbs=' + result_tbs

        # Occasionally the 'tbs' param provided by google also contains a
        # field for 'lr', but formatted strangely. This is a rough solution
        # for this.
        #
        # Example:
        # &tbs=qdr:h,lr:lang_1pl
        # -- the lr param needs to be extracted and remove the leading '1'
        result_params = [_ for _ in result_tbs.split(',') if 'lr:' in _]
        if len(result_params) > 0:
            result_param = result_params[0]
            lang = result_param[result_param.find('lr:') + 3:len(result_param)]

    # Ensure search query is parsable
    query = urlparse.quote(query)

    # Pass along type of results (news, images, books, etc)
    if 'tbm' in args:
        param_dict['tbm'] = '&tbm=' + args.get('tbm')

    # Get results page start value (10 per page, ie page 2 start val = 20)
    if 'start' in args:
        param_dict['start'] = '&start=' + args.get('start')

    # Search for results near a particular city, if available
    if config.near:
        param_dict['near'] = '&near=' + urlparse.quote(config.near)

    # Set language for results (lr) if source isn't set, otherwise use the
    # result language param provided in the results
    if 'source' in args:
        param_dict['source'] = '&source=' + args.get('source')
        param_dict['lr'] = ('&lr=' + ''.join(
            [_ for _ in lang if not _.isdigit()]
        )) if lang else ''
    else:
        param_dict['lr'] = (
            '&lr=' + config.lang_search
        ) if config.lang_search else ''

    # 'nfpr' defines the exclusion of results from an auto-corrected query
    if 'nfpr' in args:
        param_dict['nfpr'] = '&nfpr=' + args.get('nfpr')

    # 'chips' is used in image tabs to pass the optional 'filter' to add to the
    # given search term
    if 'chips' in args:
        param_dict['chips'] = '&chips=' + args.get('chips')

    param_dict['gl'] = (
        '&gl=' + config.country
    ) if config.country else ''
    param_dict['hl'] = (
        '&hl=' + config.lang_interface.replace('lang_', '')
    ) if config.lang_interface else ''
    param_dict['safe'] = '&safe=' + ('active' if config.safe else 'off')

    # Block all sites specified in the user config
    unquoted_query = urlparse.unquote(query)
    for blocked_site in config.block.replace(' ', '').split(','):
        if not blocked_site:
            continue
        block = (' -site:' + blocked_site)
        query += block if block not in unquoted_query else ''

    for val in param_dict.values():
        if not val:
            continue
        query += val

    return query


class Request:
    """Class used for handling all outbound requests, including search queries,
    search suggestions, and loading of external content (images, audio, etc).

    Attributes:
        normal_ua: the user's current user agent
        root_path: the root path of the whoogle instance
        config: the user's current whoogle configuration
    """

    def __init__(self, normal_ua, root_path, config: Config):
        # Multiple search URLs to rotate through for rate limiting avoidance
        self.search_urls = [
            'https://www.google.com/search?gbv=1&num=' + str(os.getenv('WHOOGLE_RESULTS_PER_PAGE', 10)) + '&q=',
            'https://www.google.com/search?ie=UTF-8&num=' + str(os.getenv('WHOOGLE_RESULTS_PER_PAGE', 10)) + '&q=',
            'https://www.google.com/search?source=hp&num=' + str(os.getenv('WHOOGLE_RESULTS_PER_PAGE', 10)) + '&q='
        ]
        self.current_url_index = 0
        
        # Send heartbeat to Tor, used in determining if the user can or cannot
        # enable Tor for future requests
        try:
            send_tor_signal(Signal.HEARTBEAT)
        except:
            pass  # Ignore Tor errors during initialization

        self.language = config.lang_search if config.lang_search else ''
        self.country = config.country if config.country else ''

        # For setting Accept-language Header
        self.lang_interface = ''
        if config.accept_language:
            self.lang_interface = config.lang_interface

        self.mobile = bool(normal_ua) and ('Android' in normal_ua
                                           or 'iPhone' in normal_ua)

        # Generate user agent based on config with enhanced rotation
        self.modified_user_agent = get_enhanced_user_agent(self.mobile)
        if not self.mobile:
            self.modified_user_agent_mobile = get_enhanced_user_agent(True)
        
        # Fallback to original method if needed
        self.original_user_agent = gen_user_agent(config, self.mobile)

        # Set up proxy configuration
        proxy_path = os.environ.get('WHOOGLE_PROXY_LOC', '')
        if proxy_path:
            proxy_type = os.environ.get('WHOOGLE_PROXY_TYPE', '')
            proxy_user = os.environ.get('WHOOGLE_PROXY_USER', '')
            proxy_pass = os.environ.get('WHOOGLE_PROXY_PASS', '')
            auth_str = ''
            if proxy_user:
                auth_str = f'{proxy_user}:{proxy_pass}@'

            proxy_str = f'{proxy_type}://{auth_str}{proxy_path}'
            self.proxies = {
                'https': proxy_str,
                'http': proxy_str
            }
        else:
            self.proxies = {
                'http': 'socks5://127.0.0.1:9050',
                'https': 'socks5://127.0.0.1:9050'
            } if config.tor else {}

        self.tor = config.tor
        self.tor_valid = False
        self.root_path = root_path

    def __getitem__(self, name):
        return getattr(self, name)

    def autocomplete(self, query) -> list:
        """Sends a query to Google's search suggestion service

        Args:
            query: The in-progress query to send

        Returns:
            list: The list of matches for possible search suggestions

        """
        ac_query = dict(q=query)
        if self.language:
            ac_query['lr'] = self.language
        if self.country:
            ac_query['gl'] = self.country
        if self.lang_interface:
            ac_query['hl'] = self.lang_interface

        response = self.send(base_url=AUTOCOMPLETE_URL,
                             query=urlparse.urlencode(ac_query)).text

        if not response:
            return []

        try:
            root = ET.fromstring(response)
            return [_.attrib['data'] for _ in
                    root.findall('.//suggestion/[@data]')]
        except ET.ParseError:
            # Malformed XML response
            return []

    def get_current_search_url(self):
        """Get current search URL and rotate to next one"""
        url = self.search_urls[self.current_url_index]
        self.current_url_index = (self.current_url_index + 1) % len(self.search_urls)
        return url

    def send(self, base_url='', query='', attempt=0,
             force_mobile=False, user_agent='') -> Response:
        """Sends an outbound request to a URL with enhanced rate limiting protection.

        Args:
            base_url: The URL to use in the request
            query: The optional query string for the request
            attempt: The number of attempts made for the request
            force_mobile: Optional flag to enable a mobile user agent
            user_agent: Override user agent

        Returns:
            Response: The Response object returned by the requests call
        """
        # Add delay between requests to avoid rate limiting
        add_request_delay()
        
        use_client_user_agent = int(os.environ.get('WHOOGLE_USE_CLIENT_USER_AGENT', '0'))
        if user_agent and use_client_user_agent == 1:
            modified_user_agent = user_agent
        else:
            # Use enhanced user agents with rotation
            if force_mobile and not self.mobile:
                modified_user_agent = get_enhanced_user_agent(True)
            else:
                modified_user_agent = get_enhanced_user_agent(self.mobile)

        # Enhanced headers to appear more like a real browser
        headers = {
            'User-Agent': modified_user_agent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        }

        # Override Accept-Language if configured
        if self.lang_interface:
            headers['Accept-Language'] = self.lang_interface.replace('lang_', '') + ';q=1.0'

        # Enhanced cookies to avoid detection
        now = datetime.now()
        cookies = {
            'CONSENT': 'PENDING+987',
            'SOCS': 'CAESHAgBEhIaAB',
            'NID': f'511={random.randint(100000000000000000000, 999999999999999999999)}',
            'AEC': f'Ae3NU9M{random.randint(10000000, 99999999)}',
        }

        # Validate Tor connection if enabled
        if self.tor:
            try:
                if not send_tor_signal(Signal.NEWNYM if attempt > 0 else Signal.HEARTBEAT):
                    raise TorError(
                        "Tor connection dropped. Please check configuration.",
                        disable=True)
            except:
                pass  # Continue without Tor if signal fails
                
            try:
                tor_check = requests.get('https://check.torproject.org/',
                                       proxies=self.proxies, headers=headers, timeout=10)
                self.tor_valid = 'Congratulations' in tor_check.text
                
                if not self.tor_valid:
                    raise TorError(
                        "Tor connection could not be validated",
                        disable=True)
            except (ConnectionError, requests.exceptions.Timeout):
                raise TorError("Error during Tor validation", disable=True)

        # Determine URL to use
        if base_url:
            url = base_url + query
        else:
            search_url = self.get_current_search_url()
            url = search_url + query

        try:
            # Make the request with timeout
            response = requests.get(
                url,
                proxies=self.proxies,
                headers=headers,
                cookies=cookies,
                timeout=30,
                allow_redirects=True
            )
            
            # Check for rate limiting or blocking
            if response.status_code == 429:
                # Rate limited - wait and retry with different URL
                if attempt < 3:
                    time.sleep(random.uniform(5, 15))  # Wait 5-15 seconds
                    return self.send(base_url, query, attempt + 1, force_mobile, user_agent)
                else:
                    raise requests.exceptions.RequestException("Rate limited after multiple attempts")
            
            # Check for captcha or blocking
            response_text = response.text.lower()
            if any(indicator in response_text for indicator in [
                'captcha', 'blocked', 'rate limited', 'unusual traffic',
                'robots.txt', 'access denied'
            ]):
                if attempt < 3:
                    # Try with different user agent and URL
                    time.sleep(random.uniform(3, 8))
                    return self.send(base_url, query, attempt + 1, force_mobile, user_agent)
                elif not base_url:  # Only for search requests
                    # Raise an exception that will be caught by the route handler
                    # to show the error alternatives page
                    raise requests.exceptions.RequestException("Rate limited - showing alternatives")

            # Retry with Tor if enabled and captcha detected
            if 'form id="captcha-form"' in response.text and self.tor:
                attempt += 1
                if attempt > 5:  # Reduced max attempts
                    raise TorError("Tor query failed -- max attempts exceeded")
                time.sleep(random.uniform(2, 5))
                return self.send(base_url, query, attempt, force_mobile, user_agent)

            return response
            
        except requests.exceptions.Timeout:
            if attempt < 2:
                time.sleep(random.uniform(1, 3))
                return self.send(base_url, query, attempt + 1, force_mobile, user_agent)
            raise
        except requests.exceptions.ConnectionError:
            if attempt < 2:
                time.sleep(random.uniform(2, 5))
                return self.send(base_url, query, attempt + 1, force_mobile, user_agent)
            raise
