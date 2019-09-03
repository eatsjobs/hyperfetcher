import Fetcher from './index';
import TokenGenerator from '../TokenGenerator';
import * as utils from '../utils';

const _fetch = global.fetch;

const options = {baseURL: 'http:example.com', options: {headers: {Accept: 'application/json'}}, tokenGenerator: null};
let FC;

beforeEach(() => {
    FC = new Fetcher(options);
});

afterEach(() => {
   global.fetch = _fetch;
});

describe('Fetcher initialization', () => {
    it('should set all the passed options', () => {
        expect(FC.baseURL).toBe(options.baseURL);
        expect(FC.options).toBe(options.options);
        expect(FC.tokenGenerator).toBe(options.tokenGenerator);
    });

    it('should use defaults if no options are passed', () => {
        FC = new Fetcher();
        expect(FC.baseURL).toBe(window.location.origin);
        expect(FC.options).toEqual({});
        expect(FC.tokenGenerator).toBe(null);
    });
});

test('Fetcher.setTokenGenerator', () => {
    const TG = new TokenGenerator();
    FC.setTokenGenerator(TG);
    expect(FC.tokenGenerator).toBe(TG);
});

describe('Fetcher.normalizeURL', () => {
    const absUrl = 'http://example.com';
    it('should throw error if no url is given', () => {
        expect(() => FC.normalizeURL()).toThrow('Not valid url given');
    });

    it('should call the isAbsoluteUrl', () => {
        const _isAbsoluteUrl = utils.isAbsoluteUrl;
        utils.isAbsoluteUrl = jest.fn().mockImplementation(() => true);
        FC.normalizeURL(absUrl);
        expect(utils.isAbsoluteUrl).toHaveBeenCalledWith(absUrl);
        utils.isAbsoluteUrl = _isAbsoluteUrl;
    });

    it('should return the given url if is absolute', () => {
        expect(FC.normalizeURL(absUrl)).toBe(absUrl);
    });

    it('should return the full url (baseURL + given url) if is not absolute', () => {
        const relative = '/relative-to-root';
        expect(FC.normalizeURL(relative)).toBe(`${options.baseURL}${relative}`)
    });
});

describe('Fetcher.refreshToken', () => {
    beforeEach(() => {
        FC.setTokenGenerator(new TokenGenerator());
        FC.options.headers.Authorization = 'test';
    });
    it('should return an empty promise if no tokenGenerator is set', async () => {
        FC.setTokenGenerator(undefined);
        expect(await FC.refreshToken()).toBe(undefined);
    });

    it('should set the token as Authorization in options.headers', async () => {
        global.fetch = jest.fn().mockImplementation(() => {
            return Promise.resolve({
                json() {
                    return {token: 'token', expire: 2000}
                }
            });
        });
        await FC.refreshToken();
        expect(FC.options.headers.Authorization).toBe(`Bearer token`);
    });

    it('should delete the Authorization header if the tokenGenerator does not return the token', async () => {
        global.fetch = jest.fn().mockImplementation(() => {
            return Promise.resolve({
                json() {
                    return {foo: 'bar'};
                }
            });
        });
        await FC.refreshToken();
        expect(FC.options.headers.Authorization).toBe(undefined);
    });

    it('should delete the Authorization header if the tokenGenerator throws an error', async () => {
        global.fetch = jest.fn().mockImplementation(() => {
            return Promise.reject('error');
        });
        const res = await FC.refreshToken();
        expect(res).toBe(undefined);
        expect(FC.options.headers.Authorization).toBe(undefined);
    });
});

describe('Fetcher calls', () => {
    const url = 'http://example.com';
    beforeEach(() => {
        global.fetch = jest.fn().mockImplementation((url, params) => {
            return Promise.resolve({
                json() {
                    return {url, params};
                }
            })
        })
    });

    it('should call performFetch', () => {
        const _performFetch = FC.performFetch;
        FC.performFetch = jest.fn();
        FC.get(url);
        expect(FC.performFetch).toHaveBeenCalledWith(url, {}, {}, 'GET', true);
        FC.post(url);
        expect(FC.performFetch).toHaveBeenCalledWith(url, {}, {}, 'POST', true);
        FC.head(url);
        expect(FC.performFetch).toHaveBeenCalledWith(url, {}, {}, 'HEAD', true);
        FC.put(url);
        expect(FC.performFetch).toHaveBeenCalledWith(url, {}, {}, 'PUT', true);
        FC.delete(url);
        expect(FC.performFetch).toHaveBeenCalledWith(url, {}, {}, 'DELETE', true);

        FC.performFetch = _performFetch;
    });

    it('performFetch should return the parsed content', async () => {
        const params = {foo: 'bar', baz: 'qux'};
        const body = 'body test';
        const expected = {
            url: `${url}?foo=bar&baz=qux`,
            params: Object.assign(options.options, {
                method: 'GET',
                body: 'body test',
            }),
        };
        expect(await FC.performFetch(url, params, {body}, 'GET')).toEqual(expected);
    });

    it('performFetch should return the raw content when parse = false', async () => {
        const res = await FC.performFetch(url, {}, {}, 'GET', false);
        expect(res).toHaveProperty('json');
        expect(typeof res.json).toBe('function');
    });
});
