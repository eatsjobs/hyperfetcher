/**
 * @description Class to manage the Authorization token
 * Check if the current one is still valid and fetch a new one if necessary
 * @example
 * const generator = new TokenGenerator({
 *     url: 'http://api.com/auth/refresh',
 *     clientId: 22,
 *     clientSecret: 'secret',
 * })
 * generator.refreshToken()
 *     .then(token => {
 *         // token is a valid token
 *     })
 */
class TokenGenerator {
    /**
     * @description Creates an instance of TokenGenerator.
     * @param {Object} [options = {}]
     * @param {String} [options.url = window.location.origin] The url to call to fetch a new token
     * @param {String | number} [options.clientId] client id to request a new token
     * @param {String} [options.clientSecret] client secret to request a new token
     */
    constructor({ url = window.location.origin, clientId, clientSecret } = {}) {
        this.currentCall = null;
        this.expire = Date.now() - 1000;
        this.token = null;
        this.url = url;
        Object.defineProperty(this, 'clientId', {
            value: clientId,
            writable: false,
            enumerable: false,
            configurable: false
        });

        Object.defineProperty(this, 'clientSecret', {
            value: clientSecret,
            writable: false,
            enumerable: false,
            configurable: false
        });
        this.isExpired = this.isExpired.bind(this);
    }

    /**
     * @description Check if the stored token is expired
     * @return {boolean}
     */
    isExpired() {
        return Date.now() >= this.expire;
    }

    /**
     * @description Generate a new token if the current one is expired, else uses it
     * @return {PromiseLike<T | never> | Promise<T>}
     * @example
     * generator.generate()
     *    .then(token => {
     *        // token is a valid token
     *    })
     */
    generate() {
        if (this.isExpired()) {
            if (this.currentCall) { return this.currentCall; }
            this.currentCall = fetch(this.url, {
                method: 'POST',
                credentials: 'include',
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                body: `k=${this.clientId}&s=${this.clientSecret}`
                // body: JSON.stringify( { k: this.clientId, s: this.clientSecret })
            })
                .then(resp => resp.json())
                .then((resp) => {
                    if (resp.token) {
                        this.currentCall = null;
                        this.token = resp.token;
                        this.expire = resp.expire;
                        return this.token;
                    }
                    return null;
                })
                .catch((e) => {
                    this.currentCall = null;
                    throw e;
                });
            return this.currentCall;
        }
        return Promise.resolve(this.token);
    }
}

export default TokenGenerator;
