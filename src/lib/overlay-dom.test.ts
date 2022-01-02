import { OverlayDom } from './overlay-dom';
import { ID_MAP } from '../constants';
import * as Dom from './dom';
import { OverlayLayoutStore, OverlayPosition } from '../types';
import { mockOverlayStoreOneInEachPosition } from '../test/fixtures';

describe('OverlayDom', () => {
    describe('when a new instance created', () => {
        let instance: OverlayDom;

        beforeEach(() => {
            instance = new OverlayDom('root');
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

    describe('when getContainers called', () => {
        let instance: OverlayDom;

        beforeEach(() => {
            instance = new OverlayDom('root');
        });

        it('should return the containers', () => {
            const res = instance.getContainers();
            expect(res.root.getAttribute('id')).toBe('root');
            expect(res.container?.getAttribute('id')).toBe(ID_MAP.container);
        });
    });

    describe('when createNewElementForOverlay called', () => {
        let instance: OverlayDom;

        beforeEach(() => {
            instance = new OverlayDom('root');
        });

        it('should return a new element with the correct id', () => {
            expect(
                instance.createNewElementForOverlay('myId').getAttribute('id'),
            ).toBe('myId');
        });
    });

    describe('when animateElementOut called', () => {
        let instance: OverlayDom,
            outSpy: jest.SpyInstance,
            el: HTMLElement,
            res: Promise<void>;

        beforeEach(() => {
            instance = new OverlayDom('root');
            outSpy = jest
                .spyOn(Dom, 'animateElementOut')
                .mockReturnValue(Promise.resolve());
            el = document.createElement('div');
            res = instance.animateElementOut(
                el,
                OverlayPosition.TOP_FULL_WIDTH,
                0,
            );
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should start animation with correct parameters', () => {
            expect(outSpy).toHaveBeenCalledTimes(1);
            expect(outSpy).toHaveBeenCalledWith(el, null, '100%', 0);
        });

        it('should return a promise', () => {
            expect(res).toBeInstanceOf(Promise);
        });
    });

    describe('when animateElementIn called', () => {
        let instance: OverlayDom,
            inSpy: jest.SpyInstance,
            el: HTMLElement,
            res: Promise<void>;

        beforeEach(() => {
            instance = new OverlayDom('root');
            inSpy = jest
                .spyOn(Dom, 'animateElementIn')
                .mockReturnValue(Promise.resolve());
            el = document.createElement('div');
            res = instance.animateElementIn(
                el,
                OverlayPosition.TOP_FULL_WIDTH,
                0,
            );
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should start animation with correct parameters', () => {
            expect(inSpy).toHaveBeenCalledTimes(1);
            expect(inSpy).toHaveBeenCalledWith(el, null, '100%', 0);
        });

        it('should return a promise', () => {
            expect(res).toBeInstanceOf(Promise);
        });
    });

    describe('when addElementAtPosition called', () => {
        let instance: OverlayDom;

        beforeEach(() => {
            instance = new OverlayDom('root');
        });

        it('should insert element into the correct position', () => {
            Object.values(OverlayPosition).forEach((pos) => {
                const el = document.createElement('div');
                const id = 'myId_' + pos;
                el.setAttribute('id', id);
                instance.addElementAtPosition(
                    OverlayPosition.BOTTOM_FULL_WIDTH,
                    el,
                );

                expect(
                    document.body.querySelector(
                        `#${ID_MAP.BOTTOM_FULL_WIDTH} #${id}`,
                    ),
                ).toBeTruthy();
            });
        });
    });

    describe('when getContainerForPosition called', () => {
        let instance: OverlayDom;

        beforeEach(() => {
            instance = new OverlayDom('root');
        });

        it('should return the correct container', () => {
            Object.values(OverlayPosition).forEach((pos) => {
                const res = instance.getContainerForPosition(pos);
                expect(res).toBeInstanceOf(HTMLDivElement);
                expect(res?.getAttribute('id')).toBe(ID_MAP[pos]);
            });
        });
    });

    describe('when putOverlaysInContainers called', () => {
        describe('when there are no applicable responsive rules', () => {
            let instance: OverlayDom,
                res: OverlayLayoutStore,
                placeFn: jest.Mock;

            beforeEach(() => {
                instance = new OverlayDom('root');
                placeFn = jest.fn();
                res = instance.putOverlaysInContainers(
                    mockOverlayStoreOneInEachPosition,
                    {},
                    placeFn,
                );
            });

            it('should request elements be placed into correct containers', () => {
                expect(placeFn.mock.calls).toEqual([
                    ['a', 'TOP_FULL_WIDTH'],
                    ['b', 'BOTTOM_FULL_WIDTH'],
                    ['c', 'TOP_LEFT'],
                    ['d', 'TOP_CENTER'],
                    ['e', 'TOP_RIGHT'],
                    ['f', 'BOTTOM_LEFT'],
                    ['g', 'BOTTOM_CENTER'],
                    ['h', 'BOTTOM_RIGHT'],
                ]);
            });

            it('should return a correct layout store', () => {
                const resArr = Array.from(res.entries());
                expect(resArr).toEqual([
                    ['TOP_FULL_WIDTH', ['a']],
                    ['BOTTOM_FULL_WIDTH', ['b']],
                    ['TOP_LEFT', ['c']],
                    ['TOP_CENTER', ['d']],
                    ['TOP_RIGHT', ['e']],
                    ['BOTTOM_LEFT', ['f']],
                    ['BOTTOM_CENTER', ['g']],
                    ['BOTTOM_RIGHT', ['h']],
                ]);
            });
        });

        describe('when there are applicable responsive rules', () => {
            let instance: OverlayDom,
                res: OverlayLayoutStore,
                placeFn: jest.Mock;

            beforeEach(() => {
                instance = new OverlayDom('root');
                placeFn = jest.fn();

                window.matchMedia = jest
                    .fn()
                    .mockImplementation((mq: string) => {
                        return {
                            matches: mq === 'mq1',
                            media: mq,
                        } as MediaQueryList;
                    });

                res = instance.putOverlaysInContainers(
                    mockOverlayStoreOneInEachPosition,
                    {
                        [OverlayPosition.TOP_RIGHT]: {
                            mq1: {
                                position: OverlayPosition.TOP_CENTER,
                                constraints: null,
                            },
                        },
                    },
                    placeFn,
                );
            });

            it('should request elements be placed into correct containers', () => {
                expect(placeFn.mock.calls).toEqual([
                    ['a', 'TOP_FULL_WIDTH'],
                    ['b', 'BOTTOM_FULL_WIDTH'],
                    ['c', 'TOP_LEFT'],
                    ['d', 'TOP_CENTER'],
                    ['e', 'TOP_CENTER'],
                    ['f', 'BOTTOM_LEFT'],
                    ['g', 'BOTTOM_CENTER'],
                    ['h', 'BOTTOM_RIGHT'],
                ]);
            });

            it('should return a correct layout store', () => {
                const resArr = Array.from(res.entries());
                expect(resArr).toEqual([
                    ['TOP_FULL_WIDTH', ['a']],
                    ['BOTTOM_FULL_WIDTH', ['b']],
                    ['TOP_LEFT', ['c']],
                    ['TOP_CENTER', ['d', 'e']],
                    ['TOP_RIGHT', []],
                    ['BOTTOM_LEFT', ['f']],
                    ['BOTTOM_CENTER', ['g']],
                    ['BOTTOM_RIGHT', ['h']],
                ]);
            });
        });
    });
});
