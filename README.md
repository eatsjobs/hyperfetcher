# Hyperfetcher
A fetch wrapper with TokenGenerator support

## Why?
Why not.

## How?
```javascript
npm i @eatsjobs/hyperfetcher --save
```

## Peer dependencies
In your consumer package you have to provide a 
- fetch polyfill (if needed by your target environment)
- URLSearchParams polyfill (if needed by your target environment)
- Promise A+ polyfill compliant (if needed by your target environment)

# Usage
```javascript
import Fetcher, { TokenGenerator } from '@eatjobs/hyperfetcher';

const fetcher = new Fetcher({
    baseURL: 'http://api.com/api/v1',
    options: {
        headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }
    }, new TokenGenerator({
        url: 'http://api.com/oauth/token',
        clientId: 123,
        clientSecret: 'secret123456789' // put it in your env variable if you can
    })
 )

 fetcher.get('/v01/users').then(res => res.json());
 fetcher.post('/v01/user', {}, { credentials: 'include', body: JSON.stringify({foo: 'bar'}) });
 
 // Setup token generator in a later moment:
 const generator = new TokenGenerator({
    url: 'http://api.com/oauth/token',
    clientId: 123,
    clientSecret: 'secret123456789'
 });
 fetcher.setTokenGenerator(generator);
 // Now, before every fetch requests, the library will check if the current Bearer token (if present) is valid and will try to get a new one if necessary.
 // The new token will be used as Authentication: Bearer <Token> header
```


## Installation

### NPM
```bash
npm install --save @eatsjobs/hyperfetcher
```