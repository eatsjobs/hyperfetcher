/* global fetch */
import { isAbsoluteUrl, parseResponse, compose } from '../utils/index';

/**
 * @description A simple fetcher class to better window.fetch interface
 * @example
 * const apiFetcher = new Fetcher({
 *     baseURL: 'http://api.com/api/v1',
 *     options: {
 *         headers: {
 *             'Content-Type': 'application/x-www-form-urlencoded',
 *         }
 *     }
 * });
 * // set an Authorization header for all requests
 * apiFetcher.options.headers['Authorization'] = 'Bearer <TOKEN>';
 * apiFetcher.get('/v01/users').then(res => res.json());
 * apiFetcher.post('/v01/user', {}, { credentials: 'include', body: JSON.stringify(asd) });
 */
class Fetcher {
    /**
     * @description Creates an instance of Fetcher.
     * @param {Object} [options = {}]
     * @param {String} [options.baseURL = window.location.origin]
     * The baseURL to prepend to the given relative paths
     * @param {Object} [options.options = {}] the options same as fetch spec
     * @param {TokenGenerator} [tokenGenerator=null] - the token generator instance
     */
    constructor({ baseURL = window.location.origin, options = {} } = {}, tokenGenerator = null) {
        this.baseURL = baseURL;
        this.options = options;
        this.tokenGenerator = tokenGenerator;
        this.normalizeURL = this.normalizeURL.bind(this);
        this.refreshToken = this.refreshToken.bind(this);
    }

    /**
     * @description set the token generator after initialization
     * token generator must have a .generate<Promise> method
     * @param {TokenGenerator} [tokenGenerator=null]
     * @example
     * const fetcher = new Fetcher();
     * const generator = new TokenGenerator();
     * fetcher.setTokenGenerator(generator);
     */
    setTokenGenerator(tokenGenerator = null) {
        if (tokenGenerator && typeof tokenGenerator.generate === 'function') {
            this.tokenGenerator = tokenGenerator;
        } else {
            this.tokenGenerator = null;
        }
    }

    /**
     * @ignore
     * @description add the baseUrl if the passed url is not absolute
     * @param {any} url
     * @return {String}
     */
    normalizeURL(url) {
        if (!url) { throw new Error('Not valid url given'); }
        return isAbsoluteUrl(url) ? url : this.baseURL + url;
    }

    /**
     * @ignore
     * @description called by the Fetcher Api,
     * perform the real fetch request based on the given arguments.
     * Avoid to use it directly to prevent unexpected behaviour
     * @param {String} url - absolute or relative url
     * @param {Object} params - params to append in querystring
     * @param {Object} options - the options same as fetch spec
     * @param {String} method - the request method
     * @param {boolean} [parse = true] - if the response should be a raw http response or be parsed
     * @return {PromiseLike<T | never>}
     */
    performFetch(url, params, options, method, parse = true) {
        const refreshTokenTask = this.refreshToken();
        return refreshTokenTask.then(() => fetch(
            this.normalizeURL(compose(url, params)),
            Object.assign({}, this.options, options, { method })
        )).then(res => parse ? parseResponse(res) : res); // eslint-disable-line no-confusing-arrow
    }

    /**
     * @description perform a GET request
     * @param {String} url - absolute or relative url
     * @param {Object} [params={}] - params to append in querystring
     * @param {Object} [options={}] - the options same as fetch spec
     * @param {boolean} [parse = true] - if the response should be a raw http response or be parsed
     * @return {PromiseLike<T|never>}
     * @example
     * fetcher.get('/api/v1/users', {page: 1, limit: 10})
     *     .then(users => {
     *         // Do something with the json result...
     *     });
     */
    get(url, params = {}, options = {}, parse = true) {
        return this.performFetch(url, params, options, 'GET', parse);
    }

    /**
     * @description Perform a POST request
     * @param {String} url - absolute or relative url
     * @param {Object} [params={}] - params to append in querystring
     * @param {Object} [options={}] - the options same as fetch spec
     * @param {boolean} [parse = true] - if the response should be a raw http response or be parsed
     * @return {PromiseLike<T|never>}
     * @example
     * fetcher.post('/api/v1/users', {}, {
     *     body: JSON.stringify({name: 'foo', email: 'foo@bar.baz'
     * })}).then(res => {
     *   // Do something with the json result...
     * });
     */
    post(url, params = {}, options = {}, parse = true) {
        return this.performFetch(url, params, options, 'POST', parse);
    }

    /**
     * @description Perform an HEAD request
     * @param {String} url - absolute or relative url
     * @param {Object} [params={}] - params to append in querystring
     * @param {Object} [options={}] - the options same as fetch spec
     * @param {boolean} [parse = true] - if the response should be a raw http response or be parsed
     * @return {PromiseLike<T|never>}
     * @example
     * fetcher.head('/api/v1/users')
     *     .then(res => {
     *         // Do something with the json result...
     *     });
     */
    head(url, params = {}, options = {}, parse = true) {
        return this.performFetch(url, params, options, 'HEAD', parse);
    }

    /**
     * @description Perform a PUT request
     * @param {String} url - absolute or relative url
     * @param {Object} [params={}] - params to append in querystring
     * @param {Object} [options={}] - the options same as fetch spec
     * @param {boolean} [parse = true] - if the response should be a raw http response or be parsed
     * @return {PromiseLike<T|never>}
     * @example
     * fetcher.put('/api/v1/users/1', {}, {name: 'foo'})
     *     .then(res => {
     *         // Do something with the json result...
     *     });
     */
    put(url, params = {}, options = {}, parse = true) {
        return this.performFetch(url, params, options, 'PUT', parse);
    }

    /**
     * @description Perform a DELETE request
     * @param {String} url - absolute or relative url
     * @param {Object} [params={}] - params to append in querystring
     * @param {Object} [options={}] - the options same as fetch spec
     * @param {boolean} [parse = true] - if the response should be a raw http response or be parsed
     * @return {PromiseLike<T|never>}
     * @example
     * fetcher.delete('/api/v1/users/1')
     *     .then(res => {
     *         // Do something with the json result...
     *     });
     */
    delete(url, params = {}, options = {}, parse = true) {
        return this.performFetch(url, params, options, 'DELETE', parse);
    }

    /**
     * @ignore
     * @description Call the TokenGenerator (if present) to get the Authorization token
     * and set it in the Headers
     * @return {*}
     */
    refreshToken() {
        /* eslint-disable dot-notation */
        if (!this.tokenGenerator) { return Promise.resolve(); }
        return this.tokenGenerator.generate().then((token) => {
            if (!token) {
                delete this.options.headers['Authorization'];
            } else {
                this.options.headers['Authorization'] = `Bearer ${token}`;
            }
        }).catch(() => {
            delete this.options.headers['Authorization'];
            return Promise.resolve();
        });
        /* eslint-enable dot-notation */
    }
}

export default Fetcher;
