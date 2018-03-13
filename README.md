# async-locks

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

The thread like locks in async functions

# Why

Async functions are somehow alike with multi-thread solutions. So you may need a lock to resolve the conflicts between async functions.


```
const lock = new Lock();

async append(text) {
    await lock.acquire();
    let originalText = await getText();
    await setText(originalText + text);
    lock.release();
}

Promise.all(append('FOO'), append('BAR'))
```

# Timeout

If timeout is set, the lock will be released automatically when time is out, to avoid the case that locks never get released.

```
async append(text) {
    await lock.acquire({timeout: 10000});
    await neverResponse();    // neverResponse returns a promise with resolve/reject never called. We should avoid
                              // this case from happening, but also we can add a timeout to make the code stronger.
    lock.release();
}
```

# Limit

If limit is set a positive integer, the lock will not block unless the unreleased number reached the limit.

```
const lock = new Lock({limit: 10});

async test() {
    while (true) {
        await lock.acquire();   // will get blocked at the 11 times loop
    }
}
```

[npm-image]: https://img.shields.io/npm/v/async-locks.svg?style=flat-square
[npm-url]: https://npmjs.org/package/async-locks
[travis-image]: https://img.shields.io/travis/viRingbells/async-locks/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/viRingbells/async-locks
[coveralls-image]: https://img.shields.io/codecov/c/github/viRingbells/async-locks.svg?style=flat-square
[coveralls-url]: https://codecov.io/github/viRingbells/async-locks?branch=master
