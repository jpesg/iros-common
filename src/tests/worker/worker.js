import chai, {expect} from 'chai';
import {describe, beforeEach, afterEach, before, after, it} from 'mocha';
import {Worker} from '../../index';

chai.config.includeStack = true;

function waitForAvailableWorkers(pool) {
  return new Promise(resolve => {
    const interval = setInterval(function() {

      let available = 0;
      for (const id in pool.workers) {
        if (pool.workers.hasOwnProperty(id)) {
          if (pool.workers[id].status === 'waiting') {
            available++;
          }
        }
      }

      if (Object.keys(pool.workers).length === available) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}

describe('## worker/pool', () => {
  it('creates pool with no workers', () => {

    const worker_pool = new Worker({
      maxWorkers: 0, tasks: {},
    });

    expect(worker_pool._getAvailableWorker()).to.be.undefined;
  });

  it('creates pool with one available worker which starts within 1 second', function() {
    this.timeout(2000);

    const pool = new Worker({
      maxWorkers: 1, tasks: {},
    });

    // check one worker is defined
    expect(pool.workers.length).to.be.equal(1);

    // check it's initiating
    const worker = pool.workers[0];
    expect(worker.status).to.be.equal('init');

    return new Promise((resolve) => {
      const interval = setInterval(function() {
        const available = pool._getAvailableWorker();

        if (available) {
          expect(available.process.pid).to.be.equal(worker.process.pid);
          expect(worker.status).to.be.equal('waiting');

          clearInterval(interval);
          pool.stop();
          resolve();
        }
      }, 100);
    });
  });

  it('creates pool with one available worker and executes one task', function() {
    this.timeout(3000);

    const pool = new Worker({
      maxWorkers: 1, tasks: {},
    });

    return waitForAvailableWorkers(pool)
        .then(() => new Promise(resolve => {
          const worker = pool.workers[0];

          expect(worker.end).to.be.equal(0);

          expect(pool.runTask(`${__dirname}/task`, 'success')).to.be.equal(true);

          setTimeout(function() {
            expect(worker.last).to.not.be.equal(0);
            pool.stop();
            resolve();
          }, 1000);
        }));
  });

  it('creates pool with 2 workers and get the longest waiting', function() {
    this.timeout(2000);

    const pool = new Worker({
      maxWorkers: 2, tasks: {},
    });

    return waitForAvailableWorkers(pool).then(() => {
      const first = pool._getAvailableWorker();

      pool.runTask(`${__dirname}/task`, 'success');

      const second = pool._getAvailableWorker();

      expect(first.process.pid).to.not.be.equal(second.process.pid);

      pool.stop();
    });
  });

  it('creates pool with tasks', function() {
    this.timeout(5000);

    const pool = new Worker({
      maxWorkers: 1, tasks: {
        success: {
          module: `${__dirname}/task`,
          command: 'success',
          interval: 200,
        },
      },
    });

    expect(pool.tasks.length).to.be.equal(1);

    return waitForAvailableWorkers(pool).then(() => new Promise(resolve => {
          setTimeout(function() {
            expect(pool.tasks[0].stats).to.not.be.equal(0);
            pool.stop();
            return resolve();
          }, 500);
        }),
    );
  });

  it('creates pool with one available worker and executes one task which is skipped', function() {
    this.timeout(3000);

    const pool = new Worker({
      maxWorkers: 1, tasks: {},
    });

    return waitForAvailableWorkers(pool)
        .then(() => new Promise(resolve => {
          const worker = pool.workers[0];

          expect(worker.end).to.be.equal(0);

          expect(pool.runTask(`${__dirname}/task`, 'skip')).to.be.equal(true);

          setTimeout(function() {
            expect(worker.last).to.not.be.equal(0);
            expect(worker.status).to.be.equal('waiting');
            pool.stop();
            resolve();
          }, 1000);
        }));
  });

  it('creates pool with one available worker and executes one delayed task', function() {
    this.timeout(3000);

    const pool = new Worker({
      maxWorkers: 1, tasks: {},
    });

    return waitForAvailableWorkers(pool)
        .then(() => new Promise(resolve => {
          const worker = pool.workers[0];

          expect(worker.end).to.be.equal(0);

          expect(pool.runTask(`${__dirname}/task`, 'delayedSuccess')).to.be.equal(true);

          setTimeout(function() {
            expect(worker.status).to.be.equal('working');
          }, 1000);
          setTimeout(function() {
            expect(worker.last).to.not.be.equal(0);
            expect(worker.status).to.be.equal('waiting');
            pool.stop();
            resolve();
          }, 1500);
        }));
  });

  it('creates pool with one available worker and executes one delayed task which fails', function() {
    this.timeout(3000);

    const pool = new Worker({
      maxWorkers: 1, tasks: {},
    });

    return waitForAvailableWorkers(pool)
        .then(() => new Promise(resolve => {
          const worker = pool.workers[0];

          expect(worker.end).to.be.equal(0);

          expect(pool.runTask(`${__dirname}/task`, 'delayedFail')).to.be.equal(true);

          setTimeout(function() {
            expect(worker.status).to.be.equal('working');
          }, 300);
          setTimeout(function() {
            expect(worker.last).to.not.be.equal(0);
            expect(worker.status).to.be.equal('waiting');
            pool.stop();
            resolve();
          }, 1500);
        }));
  });

  it('creates pool with one available worker and executes one delayed task which is skipped', function() {
    this.timeout(3000);

    const pool = new Worker({
      maxWorkers: 1, tasks: {},
    });

    return waitForAvailableWorkers(pool)
        .then(() => new Promise(resolve => {
          const worker = pool.workers[0];

          expect(worker.end).to.be.equal(0);

          expect(pool.runTask(`${__dirname}/task`, 'delayedSkip')).to.be.equal(true);

          setTimeout(function() {
            expect(worker.status).to.be.equal('working');
          }, 300);
          setTimeout(function() {
            expect(worker.last).to.not.be.equal(0);
            expect(worker.status).to.be.equal('waiting');
            pool.stop();
            resolve();
          }, 1500);
        }));
  });

  it('creates pool with one available worker and executes one task which is fails', function() {
    this.timeout(3000);

    const pool = new Worker({
      maxWorkers: 1, tasks: {},
    });

    return waitForAvailableWorkers(pool)
        .then(() => new Promise(resolve => {
          const worker = pool.workers[0];

          expect(worker.end).to.be.equal(0);

          expect(pool.runTask(`${__dirname}/task`, 'fail')).to.be.equal(true);

          setTimeout(function() {
            expect(worker.last).to.not.be.equal(0);
            expect(worker.status).to.be.equal('waiting');
            pool.stop();
            resolve();
          }, 1000);
        }));
  });

  it('creates pool with 20 workers', function() {
    this.timeout(5000);

    const pool = new Worker({
      maxWorkers: 20, tasks: {},
    });

    return waitForAvailableWorkers(pool).then(() => pool.stop());
  });

});