/**
 * @description Parse the fetch response (call the response json function)
 * @param {Object} res
 * @return {Promise<any>}
 */
export function parseResponse(res) {
    return res.json();
}

/**
 * @description Check if the given string is an absolute url (starts with http(s))
 * @param {String} str
 * @return {boolean}
 * @example
 * isAbsoluteUrl('http://endpoint.com/api/users') // true
 * isAbsoluteUrl('/api/users') // false
 */
export function isAbsoluteUrl(str) {
    const regex = /(https?)?:?\/\//g;
    return regex.test(str);
}

/**
 * @description Append the given query params object to the given url as queryparams
 * @param {string} url
 * @param {Object} queryParams
 * @return {String}
 * @example
 * compose('http://endpoint.com/api/users', {page: 1, limit: 10}); // http://endpoint.com/api/users?page=1&limit=10
 */
export function compose(url, queryParams) {
    const splittedUrl = url.split('?');
    const endpoint = splittedUrl[0];
    const params = splittedUrl.length > 0 ? splittedUrl[1] : '';
    const urlSearchParams = new URLSearchParams(params);

    Object.keys(queryParams).forEach((key) => {
        urlSearchParams.set(key, queryParams[key]);
    });

    return `${endpoint}?${urlSearchParams.toString()}`;
}
