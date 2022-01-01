import {
    addToBodyAndRemoveOld,
    animateElementIn,
    animateElementOut,
    createElementWithId,
    createElementWithInnerHTML,
    DEFAULT_DURATION,
    getFinalWidth,
    getFullHeightAndWidthOfElement,
    getWidthReference,
    insertAtCorrectPosition,
    transitionNumber,
    transitionOpacityIn,
    transitionOpacityOut,
} from './dom';
import { createMockDomElement, DEFAULT_DOM_RECT } from '../test/helpers';
import { OverlayId, OverlayPosition } from '../types';

describe('Dom Helpers', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('createElementWithId', () => {
        describe('when all parameters passed', () => {
            let result: HTMLElement | null = null;

            beforeEach(() => {
                result = createElementWithId('a', 'myId', 'myClass');
            });

            it('should return an element with the correct tag name', () => {
                expect(result).toBeInstanceOf(HTMLAnchorElement);
                expect(result?.tagName).toBe('A');
            });

            it('should create an element with the correct id', () => {
                expect(result?.getAttribute('id')).toBe('myId');
            });

            it('should set a class name on returned element', () => {
                expect(result?.getAttribute('class')).toBe('myClass');
            });
        });

        describe('when only required params passed', () => {
            let result: HTMLElement | null;

            beforeEach(() => {
                result = createElementWithId('a', 'myId');
            });

            it('should return an element with the correct tag name', () => {
                expect(result).toBeInstanceOf(HTMLAnchorElement);
                expect(result?.tagName).toBe('A');
            });

            it('should create an element with the correct id', () => {
                expect(result?.getAttribute('id')).toBe('myId');
            });

            it('should not set a class name on returned element', () => {
                expect(result?.getAttribute('class')).toBe('');
            });
        });
    });

    describe('createElementWithInnerHTML', () => {
        describe('when all parameters passed', () => {
            let result: HTMLElement | null;

            beforeEach(() => {
                result = createElementWithInnerHTML(
                    'a',
                    'myId',
                    '<div id="child"></div>',
                );
            });

            it('should return an element with the correct tag name', () => {
                expect(result).toBeInstanceOf(HTMLAnchorElement);
                expect(result?.tagName).toBe('A');
            });

            it('should create an element with the correct id', () => {
                expect(result?.getAttribute('id')).toBe('myId');
            });

            it('shoudl render innerHTML correctly into dom nodes', () => {
                expect(result?.querySelector('#child')).toBeInstanceOf(
                    HTMLDivElement,
                );
            });
        });
    });

    describe('addToBodyAndRemoveOld', () => {
        describe('when id already exists', () => {
            let newNode: HTMLElement, oldNode: HTMLElement;

            beforeEach(() => {
                newNode = document.createElement('div');
                newNode.setAttribute('id', 'myIdNew');
                oldNode = document.createElement('div');
                oldNode.setAttribute('id', 'myIdOld');

                document.body.appendChild(oldNode);

                addToBodyAndRemoveOld(newNode, 'myIdOld');
            });

            it('should remove the old node and replace it with the new one', () => {
                expect(document.body.children.length).toBe(1);
                expect(document.body.querySelector('#myIdNew')).toBeInstanceOf(
                    HTMLDivElement,
                );
                expect(document.body.querySelector('#myIdOld')).toBe(null);
            });
        });

        describe('when id does not exist', () => {
            let newNode: HTMLElement, oldNode: HTMLElement;

            beforeEach(() => {
                newNode = document.createElement('div');
                newNode.setAttribute('id', 'myIdNew');

                addToBodyAndRemoveOld(newNode, 'myIdOld');
            });

            it('should just add a new node', () => {
                expect(document.body.children.length).toBe(1);
                expect(document.body.querySelector('#myIdNew')).toBeInstanceOf(
                    HTMLDivElement,
                );
            });
        });
    });

    describe('animateElementIn', () => {
        describe('when transitions have not begun yet', () => {
            let el: HTMLElement,
                child: HTMLElement,
                heightSpy: jest.SpyInstance,
                displaySpy: jest.SpyInstance;

            beforeEach(() => {
                el = createMockDomElement('div', {
                    ...DEFAULT_DOM_RECT,
                    height: 0,
                    width: 0,
                });
                child = createMockDomElement('div', {
                    ...DEFAULT_DOM_RECT,
                    height: 50,
                    width: 200,
                });

                heightSpy = jest.spyOn<any, any>(el.style, 'height', 'set');
                displaySpy = jest.spyOn<any, any>(el.style, 'display', 'set');

                el.appendChild(child);

                animateElementIn(el, child, 'auto', 0).catch(() => {});
            });

            it('should set display to inline block before taking height and width measurement (so it avoids taking height and width of parent)', () => {
                expect(displaySpy.mock.calls[0][0]).toBe('inline-block');
                expect(child.getBoundingClientRect).toHaveBeenCalledTimes(1);
            });
            it('should set display to block after height and width taken', () => {
                expect(displaySpy.mock.calls[1][0]).toBe('block');
                expect(child.getBoundingClientRect).toHaveBeenCalledTimes(1);
            });

            it('should set height to auto before taking height measurement', () => {
                expect(heightSpy.mock.calls[0][0]).toBe('auto');
            });
            it('should set height to 0 after taking height measurement', () => {
                expect(heightSpy.mock.calls[1][0]).toBe('0px');
            });

            it('should set opacity to 0', () => {
                expect(el.style.opacity).toBe('0');
            });

            it('should set overflow to hidden', () => {
                expect(el.style.overflow).toBe('hidden');
            });
        });

        describe('when transitions run', () => {
            let el: HTMLElement,
                child: HTMLElement,
                heightSpy: jest.SpyInstance,
                opacitySpy: jest.SpyInstance;

            beforeEach(() => {
                el = createMockDomElement('div', {
                    ...DEFAULT_DOM_RECT,
                    height: 0,
                    width: 0,
                });
                child = createMockDomElement('div', {
                    ...DEFAULT_DOM_RECT,
                    height: 50,
                    width: 200,
                });

                const gcsMock = jest.spyOn(window, 'getComputedStyle');
                gcsMock.mockReturnValue({
                    marginLeft: '0px',
                    marginRight: '0px',
                    marginTop: '0px',
                    marginBottom: '0px',
                } as CSSStyleDeclaration);

                heightSpy = jest.spyOn<any, any>(el.style, 'height', 'set');
                opacitySpy = jest.spyOn<any, any>(el.style, 'opacity', 'set');
                el.appendChild(child);

                const raf = jest.spyOn(window, 'requestAnimationFrame');
                /**
                 * the first two calls will be for the height animation, the second
                 * callback mock will conclude the animation
                 */
                raf.mockImplementationOnce((cb: FrameRequestCallback) => {
                    cb(0);
                    return 0;
                });

                raf.mockImplementationOnce((cb: FrameRequestCallback) => {
                    /**
                     * We add 100 here ot make sure that the animation will still terminate
                     * even if request animation frame returns later than expected
                     */
                    cb(DEFAULT_DURATION + 100);
                    return 0;
                });

                /**
                 * these two callbacks are for the opacity animation
                 */
                raf.mockImplementationOnce((cb: FrameRequestCallback) => {
                    cb(0);
                    return 0;
                });

                raf.mockImplementationOnce((cb: FrameRequestCallback) => {
                    cb(DEFAULT_DURATION);
                    return 0;
                });

                const timeoutSpy = jest.spyOn(window, 'setTimeout');
                timeoutSpy.mockImplementation((cb: (args: void) => void) => {
                    cb();
                    return 1 as any;
                });

                animateElementIn(el, child, 'auto', 0).catch(() => {});
            });

            describe('when the height animation has run', () => {
                it('should transition height value with expected increments', () => {
                    expect(heightSpy.mock.calls).toEqual([
                        ['auto'], // Set to measure initial height value
                        ['0px'], // Set Just before animation begins
                        ['0px'], // Set by first call to requestAnimationFrame
                        ['50px'], // Set by final call to requestAnimationFrame
                        ['auto'], // Once animation complete set to auto in case element grows
                    ]);
                });
            });

            describe('when the opacity animation has run', () => {
                it('should transition height value with expected increments', () => {
                    expect(opacitySpy.mock.calls).toEqual([
                        ['0'], // Set before even height animation starts
                        ['0'], // Set by animation function before animation begins
                        ['0'], // Set by first requestAnimationFrame call
                        ['1'], // Set by last requestAnimationFrame call
                    ]);
                });
            });

            describe('when animation complete', () => {
                it('should set element final state correctly', () => {
                    expect(el.style.height).toBe('auto');
                    expect(el.style.width).toBe('auto');
                    expect(el.style.display).toBe('inline-block');
                    expect(el.style.overflow).toBe('initial');
                });
            });
        });
    });

    describe('animateElementOut', () => {
        describe('when transitions have not begun yet', () => {
            let el: HTMLElement,
                child: HTMLElement,
                heightSpy: jest.SpyInstance,
                displaySpy: jest.SpyInstance,
                widthSpy: jest.SpyInstance;

            beforeEach(() => {
                el = createMockDomElement('div', {
                    ...DEFAULT_DOM_RECT,
                    height: 0,
                    width: 0,
                });
                child = createMockDomElement('div', {
                    ...DEFAULT_DOM_RECT,
                    height: 50,
                    width: 200,
                });

                const gcsMock = jest.spyOn(window, 'getComputedStyle');
                gcsMock.mockReturnValue({
                    marginLeft: '0px',
                    marginRight: '0px',
                    marginTop: '0px',
                    marginBottom: '0px',
                } as CSSStyleDeclaration);

                heightSpy = jest.spyOn<any, any>(el.style, 'height', 'set');
                widthSpy = jest.spyOn<any, any>(el.style, 'width', 'set');
                displaySpy = jest.spyOn<any, any>(el.style, 'display', 'set');

                el.appendChild(child);

                animateElementOut(el, child, 'auto', 0).catch(() => {});
            });

            it('should set display to inline block before taking height and width measurement (so it avoids taking height and width of parent)', () => {
                expect(displaySpy.mock.calls[0][0]).toBe('inline-block');
                expect(child.getBoundingClientRect).toHaveBeenCalledTimes(1);
            });
            it('should set display to block after height and width taken', () => {
                expect(displaySpy.mock.calls[1][0]).toBe('block');
                expect(child.getBoundingClientRect).toHaveBeenCalledTimes(1);
            });

            it('should set height to fixed value', () => {
                expect(heightSpy.mock.calls[0][0]).toBe('50px');
            });

            it('should set width to fixed value', () => {
                expect(widthSpy.mock.calls[0][0]).toBe('200px');
            });

            it('should set opacity to 1', () => {
                expect(el.style.opacity).toBe('1');
            });

            it('should set overflow to hidden', () => {
                expect(el.style.overflow).toBe('hidden');
            });
        });

        describe('when transitions run', () => {
            let el: HTMLElement,
                child: HTMLElement,
                heightSpy: jest.SpyInstance,
                opacitySpy: jest.SpyInstance;

            beforeEach(() => {
                jest.useFakeTimers();
            });

            afterEach(() => {
                jest.useRealTimers();
                jest.clearAllMocks();
            });

            beforeEach(() => {
                el = createMockDomElement('div', {
                    ...DEFAULT_DOM_RECT,
                    height: 0,
                    width: 0,
                });
                child = createMockDomElement('div', {
                    ...DEFAULT_DOM_RECT,
                    height: 50,
                    width: 200,
                });

                const gcsMock = jest.spyOn(window, 'getComputedStyle');
                gcsMock.mockReturnValue({
                    marginLeft: '0px',
                    marginRight: '0px',
                    marginTop: '0px',
                    marginBottom: '0px',
                } as CSSStyleDeclaration);

                heightSpy = jest.spyOn<any, any>(el.style, 'height', 'set');
                opacitySpy = jest.spyOn<any, any>(el.style, 'opacity', 'set');
                el.appendChild(child);

                const raf = jest.spyOn(window, 'requestAnimationFrame');
                /**
                 * the first two calls will be for the height animation, the second
                 * callback mock will conclude the animation
                 */
                raf.mockImplementationOnce((cb: FrameRequestCallback) => {
                    cb(0);
                    return 0;
                });

                raf.mockImplementationOnce((cb: FrameRequestCallback) => {
                    /**
                     * We add 100 here ot make sure that the animation will still terminate
                     * even if request animation frame returns later than expected
                     */
                    cb(DEFAULT_DURATION + 100);
                    return 0;
                });

                /**
                 * these two callbacks are for the opacity animation
                 */
                raf.mockImplementationOnce((cb: FrameRequestCallback) => {
                    cb(0);
                    return 0;
                });

                raf.mockImplementationOnce((cb: FrameRequestCallback) => {
                    cb(DEFAULT_DURATION);
                    return 0;
                });

                const timeoutSpy = jest.spyOn(window, 'setTimeout');
                timeoutSpy.mockImplementation((cb: (args: void) => void) => {
                    cb();
                    return 1 as any;
                });

                animateElementOut(el, child, 'auto', 0).catch(() => {});
            });

            describe('when the height animation has run', () => {
                it('should transition height value with expected increments', () => {
                    expect(heightSpy.mock.calls).toEqual([
                        ['50px'], // Set to measure initial height value
                        ['50px'], // Set Just before animation begins
                        ['50px'], // Set by first call to requestAnimationFrame
                        ['0px'], // Set by final call to requestAnimationFrame
                        ['0'], // Once animation complete set to auto in case element grows
                    ]);
                });
            });

            describe('when the opacity animation has run', () => {
                it('should transition height value with expected increments', () => {
                    expect(opacitySpy.mock.calls).toEqual([
                        ['1'], // Set before even height animation starts
                        ['1'], // Set by animation function before animation begins
                        ['1'], // Set by first requestAnimationFrame call
                        ['0'], // Set by last requestAnimationFrame call
                    ]);
                });
            });

            describe('when animation complete', () => {
                it('should set element final state correctly', () => {
                    expect(el.style.height).toBe('0px');
                    expect(el.style.width).toBe('auto');
                    expect(el.style.display).toBe('inline-block');
                    expect(el.style.overflow).toBe('initial');
                });
            });
        });
    });

    describe('transitionNumber', () => {
        describe('when initial is less than target', () => {
            let result: (n: number) => string;

            beforeEach(() => {
                result = transitionNumber(50, 100);
            });

            it('should generate correct value at -10%, clamping the value to 0%', () => {
                expect(result(-0.1)).toBe('50px');
            });

            it('should generate correct value at 0%', () => {
                expect(result(0)).toBe('50px');
            });

            it('should generate correct value at 50%', () => {
                expect(result(0.5)).toBe('75px');
            });

            it('should generate correct value at 100%', () => {
                expect(result(1)).toBe('100px');
            });

            it('should generate correct value at 110%, clamping the value to 100%', () => {
                expect(result(1.1)).toBe('100px');
            });
        });

        describe('when target is less than initial', () => {
            let result: (n: number) => string;

            beforeEach(() => {
                result = transitionNumber(100, 50);
            });

            it('should generate correct value at -10%, clamping the value to 0%', () => {
                expect(result(-0.1)).toBe('100px');
            });

            it('should generate correct value at 0%', () => {
                expect(result(0)).toBe('100px');
            });

            it('should generate correct value at 50%', () => {
                expect(result(0.5)).toBe('75px');
            });

            it('should generate correct value at 100%', () => {
                expect(result(1)).toBe('50px');
            });

            it('should generate correct value at 110%, clamping the value to 100%', () => {
                expect(result(1.1)).toBe('50px');
            });
        });
    });

    describe('transitionOpacityIn', () => {
        it('should generate correct value at -10%, clamping the value to 0%', () => {
            expect(transitionOpacityIn(-0.1)).toBe('0');
        });

        it('should generate correct value at 0%', () => {
            expect(transitionOpacityIn(0)).toBe('0');
        });

        it('should generate correct value at 50%', () => {
            expect(transitionOpacityIn(0.5)).toBe('0.5');
        });

        it('should generate correct value at 100%', () => {
            expect(transitionOpacityIn(1)).toBe('1');
        });

        it('should generate correct value at 110%, clamping the value to 100%', () => {
            expect(transitionOpacityIn(1.1)).toBe('1');
        });
    });

    describe('transitionOpacityOut', () => {
        it('should generate correct value at -10%, clamping the value to 0%', () => {
            expect(transitionOpacityOut(-0.1)).toBe('1');
        });

        it('should generate correct value at 0%', () => {
            expect(transitionOpacityOut(0)).toBe('1');
        });

        it('should generate correct value at 50%', () => {
            expect(transitionOpacityOut(0.5)).toBe('0.5');
        });

        it('should generate correct value at 100%', () => {
            expect(transitionOpacityOut(1)).toBe('0');
        });

        it('should generate correct value at 110%, clamping the value to 100%', () => {
            expect(transitionOpacityOut(1.1)).toBe('0');
        });
    });

    describe('getFinalWidth', () => {
        describe('when position is null', () => {
            it('should return auto', () => {
                expect(getFinalWidth(null)).toBe('auto');
            });
        });
        describe('when position is BOTTOM_FULL_WIDTH', () => {
            it('should return 100%', () => {
                expect(getFinalWidth(OverlayPosition.BOTTOM_FULL_WIDTH)).toBe(
                    '100%',
                );
            });
        });
        describe('when position is TOP_FULL_WIDTH', () => {
            it('should return 100%', () => {
                expect(getFinalWidth(OverlayPosition.TOP_FULL_WIDTH)).toBe(
                    '100%',
                );
            });
        });
        describe('when position is any other value', () => {
            it('should return 100% for all values', () => {
                const relevantPositions = Object.values(OverlayPosition)
                    .filter(
                        (op) =>
                            ![
                                OverlayPosition.BOTTOM_FULL_WIDTH,
                                OverlayPosition.TOP_FULL_WIDTH,
                            ].includes(op),
                    )
                    .map((p) => getFinalWidth(p));
                expect(relevantPositions).toEqual(
                    relevantPositions.map(() => 'auto'),
                );
            });
        });
    });

    describe('getWidthReference', () => {
        describe('when element has children', () => {
            let el: HTMLElement;

            beforeEach(() => {
                el = document.createElement('div');
                const child = document.createElement('a');
                const childTwo = document.createElement('span');
                el.append(child, childTwo);
            });

            it('should return the first child', () => {
                const res = getWidthReference(el);
                expect(res).toBeInstanceOf(HTMLAnchorElement);
            });
        });

        describe('when element has no children', () => {
            let el: HTMLElement;

            beforeEach(() => {
                el = document.createElement('div');
            });

            it('should return null', () => {
                const res = getWidthReference(el);
                expect(res).toBe(null);
            });
        });
    });

    describe('getFullHeightAndWidthOfElement', () => {
        let el: HTMLElement, res: { width: number; height: number };

        beforeEach(() => {
            el = createMockDomElement('div', {
                ...DEFAULT_DOM_RECT,
                width: 100,
                height: 50,
            });

            const gcsMock = jest.spyOn(window, 'getComputedStyle');
            gcsMock.mockReturnValue({
                marginLeft: '10px',
                marginRight: '5px',
                marginTop: '20px',
                marginBottom: '3px',
            } as CSSStyleDeclaration);

            res = getFullHeightAndWidthOfElement(el);
        });

        it('should return the correct value inclusive of margins', () => {
            expect(res).toEqual({
                width: 100 + 10 + 5,
                height: 50 + 20 + 3,
            });
        });
    });

    describe('insertAtCorrectPosition', () => {
        describe('when id does not exist in list', () => {
            let container: HTMLElement, element: HTMLElement;
            const desiredOrder: Array<OverlayId> = ['a', 'b', 'c', 'd'];

            beforeEach(() => {
                container = document.createElement('div');

                element = document.createElement('div');
                element.setAttribute('id', 'z');

                const b = document.createElement('div');
                b.setAttribute('id', 'b');
                const c = document.createElement('div');
                c.setAttribute('id', 'c');
                const d = document.createElement('div');
                d.setAttribute('id', 'd');

                container.append(b, c, d);

                insertAtCorrectPosition('z', container, element, desiredOrder);
            });

            it('should make no changes to the list', () => {
                const idOrder = Array.prototype.slice
                    .call(container.children)
                    .map((el) => el.getAttribute('id'));
                expect(idOrder).toEqual(['b', 'c', 'd']);
            });
        });

        describe('when the insertion point is at the start of the list', () => {
            let container: HTMLElement, element: HTMLElement;
            const desiredOrder: Array<OverlayId> = ['a', 'b', 'c', 'd'];

            beforeEach(() => {
                container = document.createElement('div');

                element = document.createElement('div');
                element.setAttribute('id', 'a');

                const b = document.createElement('div');
                b.setAttribute('id', 'b');
                const c = document.createElement('div');
                c.setAttribute('id', 'c');
                const d = document.createElement('div');
                d.setAttribute('id', 'd');

                container.append(b, c, d);

                insertAtCorrectPosition('a', container, element, desiredOrder);
            });

            it('should insert element a at the start of the list', () => {
                const idOrder = Array.prototype.slice
                    .call(container.children)
                    .map((el) => el.getAttribute('id'));
                expect(idOrder).toEqual(['a', 'b', 'c', 'd']);
            });
        });

        describe('when the insertion point is at the end of the list', () => {
            let container: HTMLElement, element: HTMLElement;
            const desiredOrder: Array<OverlayId> = ['a', 'b', 'c', 'd'];

            beforeEach(() => {
                container = document.createElement('div');

                element = document.createElement('div');
                element.setAttribute('id', 'd');

                const b = document.createElement('div');
                b.setAttribute('id', 'b');
                const c = document.createElement('div');
                c.setAttribute('id', 'c');
                const a = document.createElement('div');
                a.setAttribute('id', 'a');

                container.append(a, b, c);

                insertAtCorrectPosition('d', container, element, desiredOrder);
            });

            it('should insert element a at the start of the list', () => {
                const idOrder = Array.prototype.slice
                    .call(container.children)
                    .map((el) => el.getAttribute('id'));
                expect(idOrder).toEqual(['a', 'b', 'c', 'd']);
            });
        });

        describe('when the insertion point is in the middle of the list', () => {
            let container: HTMLElement, element: HTMLElement;
            const desiredOrder: Array<OverlayId> = ['a', 'b', 'c', 'd'];

            beforeEach(() => {
                container = document.createElement('div');

                element = document.createElement('div');
                element.setAttribute('id', 'c');

                const b = document.createElement('div');
                b.setAttribute('id', 'b');
                const d = document.createElement('div');
                d.setAttribute('id', 'd');
                const a = document.createElement('div');
                a.setAttribute('id', 'a');

                container.append(a, b, d);

                insertAtCorrectPosition('c', container, element, desiredOrder);
            });

            it('should insert element a at the start of the list', () => {
                const idOrder = Array.prototype.slice
                    .call(container.children)
                    .map((el) => el.getAttribute('id'));
                expect(idOrder).toEqual(['a', 'b', 'c', 'd']);
            });
        });
    });
});
