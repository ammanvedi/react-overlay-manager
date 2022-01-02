import * as Scheduler from './scheduler';
import * as Dom from './dom';
import { OverlayState } from './overlay-state';
import { ID_MAP } from '../constants';
import { OverlayPosition, OverlaySide } from '../types';

describe('OverlayState', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.resetAllMocks();

        jest.spyOn(Scheduler, 'createScheduledFunction').mockImplementation(
            (fn) => {
                return () => {
                    fn();
                    return Promise.resolve();
                };
            },
        );
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.resetAllMocks();
    });

    describe('when a new instance created', () => {
        let instance: OverlayState, ocvMock: jest.Mock;

        beforeEach(() => {
            ocvMock = jest.fn();
            instance = new OverlayState('root', {}, ocvMock);
        });

        it('should create the root dom element in the body when initialised', () => {
            const ids = [
                `#${ID_MAP.container}`,
                `#${ID_MAP.TOP_FULL_WIDTH}`,
                `#${ID_MAP.TOP_LEFT}`,
                `#${ID_MAP.TOP_CENTER}`,
                `#${ID_MAP.TOP_RIGHT}`,
                `#${ID_MAP.BOTTOM_FULL_WIDTH}`,
                `#${ID_MAP.BOTTOM_RIGHT}`,
                `#${ID_MAP.BOTTOM_LEFT}`,
                `#${ID_MAP.BOTTOM_CENTER}`,
            ];
            expect(ids.map((id) => !!document.body.querySelector(id))).toEqual(
                ids.map(() => true),
            );
        });
    });

    describe('when setInset called', () => {
        let instance: OverlayState, ocvMock: jest.Mock;

        beforeEach(() => {
            ocvMock = jest.fn();
            instance = new OverlayState('root', {}, ocvMock);
            instance.setInset({
                id: 'a',
                extraPaddingPx: 10,
                side: OverlaySide.TOP,
                insetValue: 100,
            });
        });

        it('should apply the inset to the dom container', () => {
            expect(
                document.body.querySelector<HTMLDivElement>(
                    `#${ID_MAP.container}`,
                )?.style.inset,
            ).toBe('110px 0px 0px 0px');
        });
    });

    describe('when removeInset called', () => {
        let instance: OverlayState, ocvMock: jest.Mock;

        beforeEach(() => {
            ocvMock = jest.fn();
            instance = new OverlayState('root', {}, ocvMock);
        });

        it('should remove applied insets', () => {
            instance.setInset({
                id: 'a',
                extraPaddingPx: 10,
                side: OverlaySide.TOP,
                insetValue: 100,
            });

            expect(
                document.body.querySelector<HTMLDivElement>(
                    `#${ID_MAP.container}`,
                )?.style.inset,
            ).toBe('110px 0px 0px 0px');

            instance.removeInset('a');

            expect(
                document.body.querySelector<HTMLDivElement>(
                    `#${ID_MAP.container}`,
                )?.style.inset,
            ).toBe('0px 0px 0px 0px');
        });
    });

    describe('when registerOverlay called', () => {
        let instance: OverlayState,
            ocvMock: jest.Mock,
            racvMock: jest.Mock,
            res: HTMLElement;

        beforeEach(() => {
            ocvMock = jest.fn();
            racvMock = jest.fn();
            instance = new OverlayState('root', {}, ocvMock);
            res = instance.registerOverlay({
                id: 'a',
                position: OverlayPosition.TOP_CENTER,
                onRemovedAfterConstraintViolation: racvMock,
                priority: 1,
            });
        });

        it('should create a new overlay record', () => {
            expect(instance.getOverlay('a')).toEqual({
                id: 'a',
                onRemovedAfterConstraintViolation: racvMock,
                priority: 1,
                element: res,
                createdAt: 1,
                position: {
                    original: OverlayPosition.TOP_CENTER,
                    current: null,
                    desired: null,
                },
            });
        });

        it('should return a new html element with the correct id', () => {
            expect(res.getAttribute('id')).toBe('a');
        });
    });

    describe('when unRegisterOverlay called', () => {
        let instance: OverlayState,
            ocvMock: jest.Mock,
            racvMock: jest.Mock,
            res: HTMLElement;

        beforeEach(() => {
            ocvMock = jest.fn();
            racvMock = jest.fn();
            instance = new OverlayState('root', {}, ocvMock);
            res = instance.registerOverlay({
                id: 'a',
                position: OverlayPosition.TOP_CENTER,
                onRemovedAfterConstraintViolation: racvMock,
                priority: 1,
            });
        });

        it('should remove previously added overlay', () => {
            expect(instance.getOverlay('a')).toBeTruthy();
            instance.unregisterOverlay('a');
            expect(instance.getOverlay('a')).toBeFalsy();
        });
    });

    describe('when removeOverlay called', () => {
        let instance: OverlayState,
            ocvMock: jest.Mock,
            racvMock: jest.Mock,
            animateOutMock: jest.SpyInstance,
            animateInMock: jest.SpyInstance,
            res: HTMLElement;

        beforeEach(() => {
            ocvMock = jest.fn();
            racvMock = jest.fn();
            animateOutMock = jest
                .spyOn(Dom, 'animateElementOut')
                .mockImplementation(() => Promise.resolve());
            animateInMock = jest
                .spyOn(Dom, 'animateElementIn')
                .mockImplementation(() => Promise.resolve());
            instance = new OverlayState('root', {}, ocvMock);
            res = instance.registerOverlay({
                id: 'a',
                position: OverlayPosition.TOP_CENTER,
                onRemovedAfterConstraintViolation: racvMock,
                priority: 1,
            });
            instance.setOverlayReady('a');
        });

        it('should animate the overlay out', async () => {
            await instance.removeOverlay('a');
            expect(animateOutMock).toHaveBeenCalledTimes(1);
            expect(animateOutMock).toHaveBeenCalledWith(res, null, 'auto', 0);
        });
    });

    describe('when setOverlayReady is called', () => {
        describe('when hideAfterMs specified', () => {
            let instance: OverlayState,
                ocvMock: jest.Mock,
                racvMock: jest.Mock,
                animateOutMock: jest.SpyInstance,
                animateInMock: jest.SpyInstance,
                res: HTMLElement;

            beforeEach(() => {
                ocvMock = jest.fn();
                racvMock = jest.fn();
                animateOutMock = jest
                    .spyOn(Dom, 'animateElementOut')
                    .mockImplementation(() => Promise.resolve());
                animateInMock = jest
                    .spyOn(Dom, 'animateElementIn')
                    .mockImplementation(() => Promise.resolve());
                instance = new OverlayState('root', {}, ocvMock);
                res = instance.registerOverlay({
                    id: 'a',
                    position: OverlayPosition.TOP_CENTER,
                    onRemovedAfterConstraintViolation: racvMock,
                    priority: 1,
                    hideAfterMs: 100,
                });
                instance.setOverlayReady('a');
            });

            it('should animate the element out after the interval', () => {
                expect(animateOutMock).toHaveBeenCalledTimes(0);
                jest.runAllTimers();
                expect(animateOutMock).toHaveBeenCalledWith(
                    res,
                    null,
                    'auto',
                    0,
                );
            });
        });

        describe('when hideAfterMs not specified', () => {
            let instance: OverlayState,
                ocvMock: jest.Mock,
                racvMock: jest.Mock,
                animateOutMock: jest.SpyInstance,
                animateInMock: jest.SpyInstance,
                res: HTMLElement;

            beforeEach(() => {
                ocvMock = jest.fn();
                racvMock = jest.fn();
                animateOutMock = jest
                    .spyOn(Dom, 'animateElementOut')
                    .mockImplementation(() => Promise.resolve());
                animateInMock = jest
                    .spyOn(Dom, 'animateElementIn')
                    .mockImplementation(() => Promise.resolve());
                instance = new OverlayState('root', {}, ocvMock);
                res = instance.registerOverlay({
                    id: 'a',
                    position: OverlayPosition.TOP_CENTER,
                    onRemovedAfterConstraintViolation: racvMock,
                    priority: 1,
                });
                instance.setOverlayReady('a');
            });

            it('should not animate the element out after the interval', () => {
                expect(animateOutMock).toHaveBeenCalledTimes(0);
                jest.runAllTimers();
                expect(animateOutMock).toHaveBeenCalledTimes(0);
            });

            it('should animate element in', () => {
                expect(animateInMock).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('when reset is called', () => {
        let instance: OverlayState, ocvMock: jest.Mock;

        beforeEach(() => {
            ocvMock = jest.fn();
            instance = new OverlayState('root', {}, ocvMock);
            jest.spyOn(Dom, 'animateElementOut').mockImplementation(() =>
                Promise.resolve(),
            );
            jest.spyOn(Dom, 'animateElementIn').mockImplementation(() =>
                Promise.resolve(),
            );
            instance.setInset({
                id: 'a',
                extraPaddingPx: 10,
                side: OverlaySide.TOP,
                insetValue: 100,
            });
            instance.registerOverlay({
                id: 'a',
                position: OverlayPosition.TOP_CENTER,
                onRemovedAfterConstraintViolation: jest.fn(),
                priority: 1,
            });
            instance.setOverlayReady('a');
        });

        it('should clear insets', () => {
            expect(
                document.body.querySelector<HTMLDivElement>(
                    `#${ID_MAP.container}`,
                )?.style.inset,
            ).toBe('110px 0px 0px 0px');
            instance.reset();
            expect(
                document.body.querySelector<HTMLDivElement>(
                    `#${ID_MAP.container}`,
                )?.style.inset,
            ).toBe('');
        });

        it('should remove registered overlays from overlay store', () => {
            expect(instance.getOverlay('a')).toBeTruthy();
            instance.reset();
            expect(instance.getOverlay('a')).toBeFalsy();
        });

        it('should remove overlays from the dom', () => {
            expect(
                document.body.querySelector(`#${ID_MAP.TOP_CENTER} #a`),
            ).toBeTruthy();
            instance.reset();
            expect(
                document.body.querySelector(`#${ID_MAP.TOP_CENTER} #a`),
            ).toBeFalsy();
        });
    });
});
