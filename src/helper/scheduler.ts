type ResolveFn<T> = (value: T | PromiseLike<T>) => void;

type PlaceholderPromise<T> = {
    placeholderPromise: Promise<T>;
    setResolutionPromise: (p: Promise<T>) => void;
};

/**
 * Create a promise that will resolve when a promise that you
 * dont have yet resolves
 */
export const createPlaceholderPromise = <T>(): PlaceholderPromise<T> => {
    return (() => {
        let resolveFn: ResolveFn<T> | null = null;

        const placeholderPromise = new Promise<T>((res, rej) => {
            resolveFn = res;
        });

        const setResolutionPromise = (promise: Promise<T>) => {
            promise.then((v) => {
                if (resolveFn) {
                    resolveFn(v);
                }

                return v;
            });
        };

        return {
            placeholderPromise: placeholderPromise,
            setResolutionPromise,
        };
    })();
};

/**
 * The goal of the scheduler is to
 *
 * 1. Ensure that the layout re-calculations are not run too often
 * 2. Ensure that recalculations are only run after the previous set are finished
 *
 * We abstract this "re-calculation" logic to just be any function that returns a
 * promise.
 *
 * You may think im in a small way re-inventing react here, and I accept that.
 */
const BLOCKED = 0;
const TIMER_AND_PROMISE_SETTLED = 2;

export const createScheduledFunction = <
    V,
    A extends Array<any>,
    T extends (...args: A) => Promise<V>,
>(
    fn: T,
    callOnceEveryMs: number,
): ((...args: A) => Promise<V>) => {
    return (() => {
        /**
         * Save the most recent set of arguments that the function was
         * called with, the call on the next tick will use the most
         * recent set of arguments
         */
        let lastBlockedArgs: A | null = null;
        /**
         * We need two things to happen before we can proceed
         *
         * 1. Promise from previous invocation needs to have settled
         * 2. The timeout period must have cleared
         *
         * Each one of these events can increase this counter by one
         * so when the value reaches two we can then assert that both of
         * these operations has completed
         */
        let blockState: number = TIMER_AND_PROMISE_SETTLED;
        let placeholder: PlaceholderPromise<V> | null = null;

        const tryScheduleNextInvocation = () => {
            blockState += 1;
            if (lastBlockedArgs && blockState === TIMER_AND_PROMISE_SETTLED) {
                const argsTemp = lastBlockedArgs;
                lastBlockedArgs = null;
                /**
                 * If we did have an invocation that was blocked by either
                 * the timeout or the promise then lets schedule another
                 * invocation with the latest arguments on the back of the
                 * event queue
                 */
                setTimeout(() => {
                    _internal(...argsTemp);
                }, 0);
            }
        };

        const _internal = (...args: A): Promise<V> => {
            if (blockState !== TIMER_AND_PROMISE_SETTLED) {
                /**
                 * In the use case hen re we dont actually need to worry about the
                 * return value of the function because we are
                 */
                lastBlockedArgs = args;

                if (!placeholder) {
                    placeholder = createPlaceholderPromise<V>();
                }

                return placeholder.placeholderPromise;
            }

            blockState = BLOCKED;

            setTimeout(() => {
                tryScheduleNextInvocation();
            }, callOnceEveryMs);

            const resultPromise = fn(...args).then((res) => {
                tryScheduleNextInvocation();
                placeholder = null;
                return res;
            });

            /**
             * We are wrapping functions that return promises, however we wrap
             * them in a function that might not actually call the desired function
             * for a while. So we returned the placeholder promise earlier.
             *
             * Now we have invoked the function we can resolve the placeholder
             * promise with the actual promise.
             */
            if (placeholder) {
                placeholder.setResolutionPromise(resultPromise);
            }

            return resultPromise;
        };

        return _internal;
    })();
};
