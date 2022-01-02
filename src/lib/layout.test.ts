import {
    applyInsets,
    getConfigForMatchMedia,
    getInsetFromRef,
    getInsets,
    getNOldestOverlays,
    insertOverlayIntoList,
    removeOverlayFromList,
} from './layout';
import {
    MatchMediaRecord,
    OverlayId,
    OverlayPosition,
    OverlayRecord,
    OverlaySide,
    OverlaySideInsetStore,
    OverlayStore,
} from '../types';
import {
    createMockDomElement,
    createMockOverlayRecord,
    DEFAULT_DOM_RECT,
} from '../test/helpers';
import {
    mockInsetStoreNumericGreater,
    mockInsetStoreRefGreater,
} from '../test/fixtures';

describe('Layout Helpers', () => {
    describe('insertOverlayIntoList', () => {
        let list: Array<OverlayId>, overlays: OverlayStore;

        beforeEach(() => {
            list = ['a', 'b', 'c'];
            overlays = new Map(
                (
                    [
                        ['a', 1, 1],
                        ['b', 2, 2],
                        ['c', 4, 3],
                    ] as [string, number, number][]
                ).map(([id, priority, createdAt]) => [
                    id,
                    createMockOverlayRecord({ id, priority, createdAt }),
                ]),
            );
        });

        describe('when the item should be inserted first based on priority', () => {
            it('should return the correctly ordered list', () => {
                const overlay: OverlayRecord = createMockOverlayRecord({
                    id: 'd',
                    priority: 0,
                });
                overlays.set('d', overlay);
                const result = insertOverlayIntoList(overlay, list, overlays);
                expect(result).toEqual(['d', 'a', 'b', 'c']);
            });
        });

        describe('when the item should be inserted last based on priority', () => {
            it('should return the correctly ordered list', () => {
                const overlay: OverlayRecord = createMockOverlayRecord({
                    id: 'd',
                    priority: 5,
                });
                overlays.set('d', overlay);
                const result = insertOverlayIntoList(overlay, list, overlays);
                expect(result).toEqual(['a', 'b', 'c', 'd']);
            });
        });

        describe('when the item should be inserted in the middle of the list based on priority', () => {
            it('should return the correctly ordered list', () => {
                const overlay: OverlayRecord = createMockOverlayRecord({
                    id: 'd',
                    priority: 3,
                });
                overlays.set('d', overlay);
                const result = insertOverlayIntoList(overlay, list, overlays);
                expect(result).toEqual(['a', 'b', 'd', 'c']);
            });
        });

        describe('when item priority matches', () => {
            it('should return items with higher createdAt values should be inserted at higher indexes', () => {
                const overlay: OverlayRecord = createMockOverlayRecord({
                    id: 'd',
                    priority: 4,
                    createdAt: 2,
                });
                overlays.set('d', overlay);
                const result = insertOverlayIntoList(overlay, list, overlays);
                expect(result).toEqual(['a', 'b', 'c', 'd']);
            });
        });
    });

    describe('removeOverlayFromList', () => {
        let list: Array<OverlayId>, overlays: OverlayStore;

        beforeEach(() => {
            list = ['a', 'b', 'c'];
            overlays = new Map(
                (
                    [
                        ['a', 1, 1],
                        ['b', 2, 2],
                        ['c', 4, 3],
                    ] as [string, number, number][]
                ).map(([id, priority, createdAt]) => [
                    id,
                    createMockOverlayRecord({ id, priority, createdAt }),
                ]),
            );
        });

        describe('when id does not exist in list', () => {
            it('should return same list that it was passed', () => {
                const result = removeOverlayFromList('x', list, overlays);
                expect(result).toEqual(list);
            });
        });

        describe('when id does exist in list', () => {
            let removeSpy: jest.SpyInstance, result: Array<OverlayId>;
            beforeEach(() => {
                const oc = overlays.get('c');
                if (oc) {
                    removeSpy = jest.spyOn(oc.element, 'remove');
                }

                result = removeOverlayFromList('c', list, overlays);
            });
            it('should call remove on the element to be removed', () => {
                expect(removeSpy).toHaveBeenCalledTimes(1);
            });

            it('should remove the item from the list', () => {
                expect(result).toEqual(['a', 'b']);
            });
        });
    });

    describe('getConfigForMatchMedia', () => {
        let record: MatchMediaRecord;

        beforeEach(() => {
            record = {
                failQueryOne: {
                    constraints: [],
                    position: OverlayPosition.BOTTOM_FULL_WIDTH,
                },
                passQuery: {
                    constraints: [],
                    position: OverlayPosition.BOTTOM_FULL_WIDTH,
                },
            };

            window.matchMedia = (() => {
                throw new Error('You should mock this');
            }) as unknown as typeof window.matchMedia;
            const mmSpy = jest.spyOn(window, 'matchMedia');
            mmSpy.mockImplementation((q) => {
                return (
                    q === 'passQuery'
                        ? {
                              matches: true,
                              media: q,
                          }
                        : {
                              matches: false,
                              media: q,
                          }
                ) as MediaQueryList;
            });
        });

        describe('when record is null', () => {
            it('should return null', () => {
                const result = getConfigForMatchMedia(null);
                expect(result).toBe(null);
            });
        });

        describe('when no matching query found', () => {
            it('should return null', () => {
                const result = getConfigForMatchMedia({
                    failQuery: record.failQueryOne,
                });
                expect(result).toBe(null);
            });
        });

        describe('when matching query found', () => {
            it('should return first matching configuration', () => {
                const result = getConfigForMatchMedia(record);
                expect(result).toBe(record.passQuery);
            });
        });
    });

    describe('getInsetFromRef', () => {
        let el: HTMLElement, elZero: HTMLElement;

        beforeEach(() => {
            el = createMockDomElement('div', {
                ...DEFAULT_DOM_RECT,
                width: 100,
                height: 200,
                bottom: 100,
                top: 100,
                left: 100,
                right: 50,
            });
            elZero = createMockDomElement('div');
        });

        describe('when extra padding is passed', () => {
            describe('when side is OverlaySide.BOTTOM', () => {
                describe('when element has size', () => {
                    it('should return the correct value based on size of passed ref', () => {
                        const res = getInsetFromRef(el, OverlaySide.BOTTOM, 10);
                        expect(res).toBe(10 + 100 + 200);
                    });
                });

                describe('when element has no size', () => {
                    it('should return 0', () => {
                        const res = getInsetFromRef(
                            elZero,
                            OverlaySide.BOTTOM,
                            10,
                        );
                        expect(res).toBe(0);
                    });
                });
            });

            describe('when side is OverlaySide.LEFT', () => {
                describe('when element has size', () => {
                    it('should return the correct value based on size of passed ref', () => {
                        const res = getInsetFromRef(el, OverlaySide.LEFT, 10);
                        expect(res).toBe(10 + 100 + 100);
                    });
                });

                describe('when element has no size', () => {
                    it('should return 0', () => {
                        const res = getInsetFromRef(
                            elZero,
                            OverlaySide.BOTTOM,
                            10,
                        );
                        expect(res).toBe(0);
                    });
                });
            });

            describe('when side is OverlaySide.RIGHT', () => {
                describe('when element has size', () => {
                    it('should return the correct value based on size of passed ref', () => {
                        const res = getInsetFromRef(el, OverlaySide.RIGHT, 10);
                        expect(res).toBe(10 + 50 + 100);
                    });
                });

                describe('when element has no size', () => {
                    it('should return 0', () => {
                        const res = getInsetFromRef(
                            elZero,
                            OverlaySide.BOTTOM,
                            10,
                        );
                        expect(res).toBe(0);
                    });
                });
            });

            describe('when side is OverlaySide.TOP', () => {
                describe('when element has size', () => {
                    it('should return the correct value based on size of passed ref', () => {
                        const res = getInsetFromRef(el, OverlaySide.TOP, 10);
                        expect(res).toBe(10 + 100 + 200);
                    });
                });

                describe('when element has no size', () => {
                    it('should return 0', () => {
                        const res = getInsetFromRef(
                            elZero,
                            OverlaySide.BOTTOM,
                            10,
                        );
                        expect(res).toBe(0);
                    });
                });
            });
        });
    });

    describe('getInsets', () => {
        describe('when inset store is empty', () => {
            it('should return all insets as 0', () => {
                const res = getInsets(new Map());
                expect(res).toEqual({
                    [OverlaySide.TOP]: 0,
                    [OverlaySide.BOTTOM]: 0,
                    [OverlaySide.LEFT]: 0,
                    [OverlaySide.RIGHT]: 0,
                });
            });
        });

        describe('when the numeric insets are greater than ref insets', () => {
            const res = getInsets(mockInsetStoreNumericGreater);
            expect(res).toEqual({
                [OverlaySide.TOP]: 0,
                [OverlaySide.BOTTOM]: 0,
                [OverlaySide.LEFT]: 127,
                [OverlaySide.RIGHT]: 0,
            });
        });

        describe('when the numeric insets are greater than ref insets', () => {
            const res = getInsets(mockInsetStoreRefGreater);
            expect(res).toEqual({
                [OverlaySide.TOP]: 0,
                [OverlaySide.BOTTOM]: 0,
                [OverlaySide.LEFT]: 326,
                [OverlaySide.RIGHT]: 0,
            });
        });
    });

    describe('applyInsets', () => {
        it('should set inset values correctly', () => {
            const el = document.createElement('div');
            const res = applyInsets(el, {
                [OverlaySide.TOP]: 10,
                [OverlaySide.BOTTOM]: 2,
                [OverlaySide.LEFT]: 6,
                [OverlaySide.RIGHT]: 100,
            });

            expect(el.style.inset).toBe('10px 100px 2px 6px');
        });
    });

    describe('getNOldestOverlays', () => {
        let list: Array<OverlayRecord>;

        beforeEach(() => {
            list = [
                createMockOverlayRecord({
                    id: 'a',
                    createdAt: 9,
                }),
                createMockOverlayRecord({
                    id: 'b',
                    createdAt: 1,
                }),
                createMockOverlayRecord({
                    id: 'd',
                    createdAt: 4,
                }),
                createMockOverlayRecord({
                    id: 'c',
                    createdAt: 3,
                }),
            ];
        });

        describe('when an empty list is passed', () => {
            it('should return an empty list', () => {
                const res = getNOldestOverlays([], 3);
                expect(res).toEqual([]);
            });
        });

        describe('when a list with length > n is passed', () => {
            it('should return a list of n items', () => {
                const res = getNOldestOverlays(list, 10);
                expect(res).toEqual([...list]);
            });
        });

        describe('when a list with length < n is passed', () => {
            it('should return the whole list', () => {
                const res = getNOldestOverlays(list, 3);
                expect(res).toEqual([list[1], list[3], list[2]]);
            });
        });
    });
});
