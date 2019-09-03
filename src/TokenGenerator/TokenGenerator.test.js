import TokenGenerator from './index';

const _Date = Date;

const options = {url: 'http://example.com', clientId: 123, clientSecret: 'secret'};
let TG;

beforeEach(() => {
   global.fetch = jest.fn().mockImplementation(() => {
       return Promise.resolve({
           json() {
               return {token: 'newToken', expire: 2000}
           }
       });
   });
    global.Date.now = jest.fn().mockImplementation(() => 10000);
    TG = new TokenGenerator(options)
});

afterEach(() => {
    global.Date.now = _Date.now;
});

describe('TokenGenerator initialization', () => {
    it('should set all the passed options and the default options', () => {
        expect(TG.clientId).toBe(options.clientId);
        expect(TG.clientSecret).toBe(options.clientSecret);
        expect(TG.url).toBe(options.url);
        expect(TG.currentCall).toBe(null);
        expect(TG.expire).toBe(9000);
        expect(TG.token).toBe(null);
    });

    it('should use defaults if no options are passed', () => {
        TG = new TokenGenerator();
        expect(TG.clientId).toBe(undefined);
        expect(TG.clientSecret).toBe(undefined);
        expect(TG.url).toBe(window.location.origin);
    });
});

test('isExpired should return true if the expire prop is in the past', () => {
    expect(TG.isExpired()).toBe(true);
});

describe('TokenGenerator.generate', () => {
    it('should return the stored token if is not expired', async () => {
        TG.expire = 11000;
        TG.token = 'secretToken';
        expect(await TG.generate()).toBe('secretToken');
    });

    it('should do a http call with fetch is the token is expired', () => {
        const expected = {
            method: 'POST',
            credentials: 'include',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: `k=${options.clientId}&s=${options.clientSecret}`
        };
        TG.generate();
        expect(fetch).toHaveBeenCalledWith(options.url, expected);
    });

    it('should fetch the new token and store it', async () => {
        await TG.generate();
        expect(TG.token).toBe('newToken');
        expect(TG.expire).toBe(2000);
    });

    it('should return null if no token is fetched', async () => {
        global.fetch = jest.fn().mockImplementation(() => {
            return Promise.resolve({
                json() {
                    return {foo: 'bar'}
                }
            });
        });
        const res = await TG.generate();
        expect(res).toBe(null);
        expect(await TG.currentCall).toBe(null);
    });

    it('should reset currentCall if cannot fetch', async () => {
        global.fetch = jest.fn().mockImplementation(() => {
            return Promise.reject('error');
        });
        const res = async () => await TG.generate();
        expect(TG.currentCall).toBe(null);
        expect(await TG.generate().catch(e => e)).toBe('error');
    });

    it('should return a previously set currentCall', () => {
        TG.currentCall = 'pending';
        expect(TG.generate()).toBe('pending');
    });
});