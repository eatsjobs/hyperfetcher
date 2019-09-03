import { isAbsoluteUrl, parseResponse, compose } from './index';

describe('isAbsoluteUrl', () => {
    it('should return true if the given string is a full https url', () => {
        expect(isAbsoluteUrl('https://example.com')).toBe(true);
    });

    it('should return true if the given string is a full http url', () => {
        expect(isAbsoluteUrl('http://example.com')).toBe(true);
    });

    it('should return false if the given string is not a url', () => {
        expect(isAbsoluteUrl('not a url')).toBe(false);
        expect(isAbsoluteUrl('not-a-url')).toBe(false);
    });

    it('should return false if the given string is not a full url but a relative url', () => {
        expect(isAbsoluteUrl('/relative/url')).toBe(false);
    });
});

describe('parseResponse', () => {
    it('should call the json() method of the given response', () => {
        const res = {
            json: jest.fn()
        };
        parseResponse(res);
        expect(res.json).toHaveBeenCalled();
    });

    it('should return the json method result', () => {
        const res = {
            json() {
                return {foo: 'bar'};
            }
        };
        expect(parseResponse(res)).toEqual({foo: 'bar'});
    });
});

describe('compose', () => {
    it('should add the queryparams object to the url', () => {
        const url = 'http://example.com';
        const params = {foo: 'bar', baz: 'qux'};
        const expected = 'http://example.com?foo=bar&baz=qux';
        expect(compose(url, params)).toEqual(expected);
    });

    it('should append the given queryparams to existing params', () => {
        const url = 'http://example.com?waldo=fred';
        const params = {foo: 'bar', baz: 'qux'};
        const expected = 'http://example.com?waldo=fred&foo=bar&baz=qux';
        expect(compose(url, params)).toEqual(expected);
    });

    it('should replace existing params with the given ones on key match', () => {
        const url = 'http://example.com?foo=thud';
        const params = {foo: 'bar', baz: 'qux'};
        const expected = 'http://example.com?foo=bar&baz=qux';
        expect(compose(url, params)).toEqual(expected);
    });
});