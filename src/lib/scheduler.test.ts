import { createScheduledFunction } from './scheduler';

const waitFunc = (timeout: number) => () => {
    return new Promise<void>((res, rej) => {
        setTimeout(res, timeout);
    });
};

describe('scheduler', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    describe('when work is done before the interval ends', () => {
        describe('when the function is called multiple times in the same interval', () => {
            let fn: jest.Mock<Promise<void>>,
                scheduledFn: (arg: string) => Promise<any>;

            beforeEach(() => {
                fn = jest.fn(waitFunc(1000));
                scheduledFn = createScheduledFunction(fn, 2000);
            });

            it('should only invoke the function once in the current interval and once in the next', async () => {
                scheduledFn('a');
                // Function called before promise resolved, should be blocked
                scheduledFn('b');
                expect(fn).toHaveBeenCalledTimes(1);
                expect(fn).toHaveBeenCalledWith('a');
                // Advance to just after promise resolved
                jest.advanceTimersByTime(1010);
                // Function called before timer complete, should be blocked
                scheduledFn('c');
                // Advance to after timer complete
                jest.advanceTimersByTime(2000);
                scheduledFn('d');
                // https://stackoverflow.com/questions/52177631/jest-timer-and-promise-dont-work-well-settimeout-and-async-function
                await Promise.resolve();
                jest.advanceTimersByTime(10);
                expect(fn).toHaveBeenCalledTimes(2);
                expect(fn).toHaveBeenCalledWith('d');
            });
        });
    });

    describe('when work is not done before the interval ends', () => {
        describe('when the function is called multiple times in the same interval', () => {
            let fn: jest.Mock<Promise<void>>,
                scheduledFn: (arg: string) => Promise<any>;

            beforeEach(() => {
                fn = jest.fn(waitFunc(2000));
                scheduledFn = createScheduledFunction(fn, 500);
            });

            it('should only invoke the function once in the time while promise is resolving', async () => {
                scheduledFn('a');
                // Function called before promise resolved, should be blocked
                scheduledFn('b');
                expect(fn).toHaveBeenCalledTimes(1);
                expect(fn).toHaveBeenCalledWith('a');
                // Advance to after the timer has fired
                jest.advanceTimersByTime(600);
                expect(fn).toHaveBeenCalledTimes(1);
                // Advance to after promise resolved
                jest.advanceTimersByTime(2000);
                await Promise.resolve();
                jest.advanceTimersByTime(10);
                expect(fn).toHaveBeenCalledTimes(2);
                expect(fn).toHaveBeenCalledWith('b');
            });
        });
    });
});
