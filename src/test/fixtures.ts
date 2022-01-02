import { OverlaySide, OverlaySideInsetStore } from '../types';
import { createMockDomElement, DEFAULT_DOM_RECT } from './helpers';

export const mockInsetStoreNumericGreater: OverlaySideInsetStore = new Map([
    [
        'a',
        {
            insetValue: 11,
            id: 'a',
            side: OverlaySide.LEFT,
            extraPaddingPx: 0,
        },
    ],
    [
        'b',
        {
            insetValue: 100,
            id: 'b',
            side: OverlaySide.LEFT,
            extraPaddingPx: 16,
        },
    ],
    [
        // result inset is 10 + 100 + 16 = 126
        'c',
        {
            insetValue: createMockDomElement('div', {
                ...DEFAULT_DOM_RECT,
                height: 100,
                width: 100,
                left: 10,
                top: 50,
                bottom: 100,
                right: 600,
            }),
            id: 'c',
            side: OverlaySide.LEFT,
            extraPaddingPx: 16,
        },
    ],
]);

export const mockInsetStoreRefGreater: OverlaySideInsetStore = new Map([
    [
        'a',
        {
            insetValue: 11,
            id: 'a',
            side: OverlaySide.LEFT,
            extraPaddingPx: 0,
        },
    ],
    [
        'b',
        {
            insetValue: 10,
            id: 'b',
            side: OverlaySide.LEFT,
            extraPaddingPx: 16,
        },
    ],
    [
        // result inset is 10 + 100 + 16 = 126
        'c',
        {
            insetValue: createMockDomElement('div', {
                ...DEFAULT_DOM_RECT,
                height: 100,
                width: 100,
                left: 10,
                top: 50,
                bottom: 100,
                right: 600,
            }),
            id: 'c',
            side: OverlaySide.LEFT,
            extraPaddingPx: 16,
        },
    ],
    [
        // result inset is 10 + 300 + 16 = 326
        'd',
        {
            insetValue: createMockDomElement('div', {
                ...DEFAULT_DOM_RECT,
                height: 100,
                width: 300,
                left: 10,
                top: 50,
                bottom: 100,
                right: 600,
            }),
            id: 'd',
            side: OverlaySide.LEFT,
            extraPaddingPx: 16,
        },
    ],
]);
