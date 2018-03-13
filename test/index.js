'use strict';

const Lock  = require('async-locks');

describe('async locks', () => {

    it('should block if locked', async () => {
        const timeline = [Date.now()];
        const lock = new Lock();
        const sign = await lock.acquire();
        timeline.push(Date.now());
        setTimeout(() => lock.release(sign), 100);
        await lock.acquire();
        timeline.push(Date.now());
        (timeline[1] - timeline[0]).should.be.lessThan(10);
        (timeline[2] - timeline[1]).should.be.greaterThan(90);
    });

    it('should not block until reach limit', async () => {
        const timeline = [Date.now()];
        const lock = new Lock({ limit: 10 });
        for (let i = 0; i < 12; i++) {
            await lock.acquire({timeout: 100 + i});
            timeline.push(Date.now());
        }
        for (let i = 1; i <= 10; i++) {
            (timeline[i] - timeline[0]).should.be.lessThan(10);
        }
        for (let i = 11; i <= 12; i++) {
            (timeline[i] - timeline[0]).should.be.greaterThan(90);
        }
    });

    it('should be ok release locks that has not been acquired yet', async () => {
        const lock = new Lock();
        lock.release();
        await lock.acquire();
        lock.release();
        lock.release();
    });

});
