/**
 * @file  Lock in async-await style code
 **/
'use strict';

const _             = require('lodash');
const assert        = require('assert');
const debug         = require('debug')('async-locks');
const randomString  = require('crypto-random-string');

const RANDOM_STRING_LEN = 16;
const DEFAULT_TIMEOUT = 0;  // means no timeout


class Lock {

    static get DEFAUL_OPTIONS() {
        return _.cloneDeep({
            timeout: DEFAULT_TIMEOUT,
            limit: 1,
        });
    }

    constructor(options = {}) {
        assert(options instanceof Object, 'Invalid type of options, should be an object');
        debug('construct');
        this.options = _.chain(options)
            .cloneDeep()
            .defaults(Lock.DEFAUL_OPTIONS)
            .pick(Object.keys(Lock.DEFAUL_OPTIONS))
            .value();
        this._acquired = new Set();
        this._waiting = [];
    }

    async acquire({key, timeout} = {}) {
        key = key || randomString(RANDOM_STRING_LEN);
        const sign = Symbol(key);
        timeout = timeout || this.options.timeout;
        debug(`acquire [${sign.toString()}]`);
        if (this._acquired.size >= this.options.limit) {
            await this._wait();
        }
        debug(`acquire [${sign.toString()}] acquired!`);
        this._acquired.add(sign);
        if (!Number.isInteger(timeout) || timeout <= 0) {
            return;
        }
        setTimeout(() => this.release(sign), timeout);
    }

    _wait() {
        return new Promise(resolve => this._waiting.push(resolve));
    }

    release(sign = null) {
        if (this._acquired.size === 0) {
            return;
        }
        sign = sign || [...this._acquired.values()][0];
        debug(sign);
        assert('symbol' === typeof sign, 'Invalid type of sign, should be a symbol returned by lock.acquire()');
        debug(`release ${sign.toString()}`);
        const deleted = this._acquired.delete(sign);
        if (this._waiting.length === 0 || !deleted) {
            return;
        }
        const resolve = this._waiting.shift();
        resolve();
    }

}


module.exports = Lock;
