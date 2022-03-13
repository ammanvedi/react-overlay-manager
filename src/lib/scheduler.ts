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
        let currentExecution: Promise<V> | null = null;

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
            if (blockState !== TIMER_AND_PROMISE_SETTLED && currentExecution) {
                /**
                 * In the use case hen re we dont actually need to worry about the
                 * return value of the function because we are
                 */
                lastBlockedArgs = args;

                return currentExecution;
            }

            blockState = BLOCKED;

            setTimeout(() => {
                tryScheduleNextInvocation();
            }, callOnceEveryMs);

            currentExecution = fn(...args).then((res) => {
                tryScheduleNextInvocation();
                currentExecution = null;
                return res;
            });

            return currentExecution;
        };

        return _internal;
    })();
};
