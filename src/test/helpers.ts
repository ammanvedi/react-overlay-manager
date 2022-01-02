import { OverlayPosition, OverlayRecord } from '../types';

export const DEFAULT_DOM_RECT: Omit<DOMRect, 'toJSON'> = {
    height: 0,
    width: 0,
    left: 0,
    bottom: 0,
    right: 0,
    top: 0,
    x: 0,
    y: 0,
};

export const createMockDomElement = <T extends keyof HTMLElementTagNameMap>(
    tagName: T,
    rect: Omit<DOMRect, 'toJSON'> = DEFAULT_DOM_RECT,
): HTMLElementTagNameMap[T] => {
    const el: HTMLElement = document.createElement(tagName);

    const rectMock = jest.spyOn(el, 'getBoundingClientRect');
    rectMock.mockReturnValue({ ...rect, toJSON: () => '' });

    return el as HTMLElementTagNameMap[T];
};

export const createMockOverlayRecord = (
    record: Partial<OverlayRecord>,
): OverlayRecord => ({
    id: 'a',
    element: document.createElement('div'),
    position: {
        current: OverlayPosition.BOTTOM_FULL_WIDTH,
        desired: OverlayPosition.BOTTOM_FULL_WIDTH,
        original:
            OverlayPosition.BOTTOM_FULL_WIDTH as Readonly<OverlayPosition>,
    },
    createdAt: 1,
    onRemovedAfterConstraintViolation: jest.fn(),
    priority: 1,
    ...record,
});
