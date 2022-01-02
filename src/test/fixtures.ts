import {
    OverlayPosition,
    OverlaySide,
    OverlaySideInsetStore,
    OverlayStore,
} from '../types';
import {
    createMockDomElement,
    createMockOverlayRecord,
    DEFAULT_DOM_RECT,
} from './helpers';

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

export const mockOverlayStoreOneInEachPosition: OverlayStore = new Map([
    [
        'a',
        createMockOverlayRecord({
            id: 'a',
            position: {
                original: OverlayPosition.TOP_FULL_WIDTH,
                desired: OverlayPosition.TOP_FULL_WIDTH,
                current: OverlayPosition.TOP_FULL_WIDTH,
            },
        }),
    ],
    [
        'b',
        createMockOverlayRecord({
            id: 'b',
            position: {
                original: OverlayPosition.BOTTOM_FULL_WIDTH,
                desired: OverlayPosition.BOTTOM_FULL_WIDTH,
                current: OverlayPosition.BOTTOM_FULL_WIDTH,
            },
        }),
    ],
    [
        'c',
        createMockOverlayRecord({
            id: 'c',
            position: {
                original: OverlayPosition.TOP_LEFT,
                desired: OverlayPosition.TOP_LEFT,
                current: OverlayPosition.TOP_LEFT,
            },
        }),
    ],
    [
        'd',
        createMockOverlayRecord({
            id: 'd',
            position: {
                original: OverlayPosition.TOP_CENTER,
                desired: OverlayPosition.TOP_CENTER,
                current: OverlayPosition.TOP_CENTER,
            },
        }),
    ],
    [
        'e',
        createMockOverlayRecord({
            id: 'e',
            position: {
                original: OverlayPosition.TOP_RIGHT,
                desired: OverlayPosition.TOP_RIGHT,
                current: OverlayPosition.TOP_RIGHT,
            },
        }),
    ],
    [
        'f',
        createMockOverlayRecord({
            id: 'f',
            position: {
                original: OverlayPosition.BOTTOM_LEFT,
                desired: OverlayPosition.BOTTOM_LEFT,
                current: OverlayPosition.BOTTOM_LEFT,
            },
        }),
    ],
    [
        'g',
        createMockOverlayRecord({
            id: 'g',
            position: {
                original: OverlayPosition.BOTTOM_CENTER,
                desired: OverlayPosition.BOTTOM_CENTER,
                current: OverlayPosition.BOTTOM_CENTER,
            },
        }),
    ],
    [
        'h',
        createMockOverlayRecord({
            id: 'h',
            position: {
                original: OverlayPosition.BOTTOM_RIGHT,
                desired: OverlayPosition.BOTTOM_RIGHT,
                current: OverlayPosition.BOTTOM_RIGHT,
            },
        }),
    ],
]);
