import {
    InsetRect,
    MatchMediaRecord,
    OverlayId,
    OverlayLayoutStore,
    OverlayPosition,
    OverlayRecord,
    OverlaySide,
    OverlaySideInsetStore,
    OverlayStore,
    ResponsiveConstraints,
} from '../types';

/**
 * instead of adding the entry and sorting the whole list
 * every time we just make sure every time we insert an overlay
 * we insert it in the correct position in the list
 *
 * I think this will be better as each insertion will take o(n) as
 * a worst case rather than doing a logarithmic time sort each insertion
 */
export const insertOverlayIntoList = (
    overlay: OverlayRecord,
    list: Array<OverlayId>,
    overlays: OverlayStore,
): Array<OverlayId> => {
    for (let i = 0; i < list.length; i++) {
        const el = overlays.get(list[i]);

        if (el && el.priority >= overlay.priority) {
            return [...list.slice(0, i), overlay.id, ...list.slice(i)];
        }
    }

    return [...list, overlay.id];
};

export const removeOverlayFromList = (
    id: string,
    list: Array<OverlayId>,
    overlays: OverlayStore,
): Array<OverlayId> => {
    for (let i = 0; i < list.length; i++) {
        const o = overlays.get(list[i]);

        if (o && o.id === id) {
            o.element.remove();
            return [...list.slice(0, i), ...list.slice(i + 1)];
        }
    }

    return list;
};

export const getNewLayoutStore = (): OverlayLayoutStore =>
    new Map(
        Object.values(OverlayPosition).map((op) => [
            op,
            [] as Array<OverlayId>,
        ]),
    );

export const getNewInsetStore = (): OverlaySideInsetStore => {
    return new Map();
};

export const getNewOverlayStore = (): OverlayStore => new Map();

export const getConfigForMatchMedia = (
    record: MatchMediaRecord | null,
): ResponsiveConstraints | null => {
    if (!record) {
        return null;
    }

    for (const mediaQuery in record) {
        const { matches } = window.matchMedia(mediaQuery);

        if (matches) {
            return record[mediaQuery];
        }
    }

    return null;
};

/**
 * Adds to layout store in place
 */
export const addToLayoutStore = (
    layoutStore: OverlayLayoutStore,
    position: OverlayPosition,
    overlay: OverlayRecord,
    overlays: OverlayStore,
) => {
    layoutStore.set(
        position,
        insertOverlayIntoList(
            overlay,
            layoutStore.get(position) as Array<OverlayId>,
            overlays,
        ),
    );
};

export const getInsetFromRef = (
    ref: HTMLElement,
    side: OverlaySide,
    extraPadding: number,
): number => {
    const rect = ref.getBoundingClientRect();

    let result = 0;
    switch (side) {
        case OverlaySide.BOTTOM:
            result = rect.bottom + rect.height;
            break;
        case OverlaySide.LEFT:
            result = rect.left + rect.width;
            break;
        case OverlaySide.RIGHT:
            result = rect.right + rect.width;
            break;
        case OverlaySide.TOP:
            result = rect.top + rect.height;
            break;
    }

    return result > 0 ? result + extraPadding : 0;
};

export const getInsets = (insetStore: OverlaySideInsetStore): InsetRect => {
    const result: InsetRect = {
        [OverlaySide.TOP]: 0,
        [OverlaySide.BOTTOM]: 0,
        [OverlaySide.LEFT]: 0,
        [OverlaySide.RIGHT]: 0,
    };

    for (const [
        _,
        { insetValue, side, extraPaddingPx },
    ] of insetStore.entries()) {
        switch (typeof insetValue) {
            case 'number':
                result[side] += insetValue + extraPaddingPx;
                break;
            case 'object':
                result[side] += insetValue
                    ? getInsetFromRef(insetValue, side, extraPaddingPx)
                    : 0;
        }
    }

    return result;
};

export const applyInsets = (el: HTMLElement, insets: InsetRect) => {
    el.style.inset = `${insets[OverlaySide.TOP]}px ${
        insets[OverlaySide.RIGHT]
    }px ${insets[OverlaySide.BOTTOM]}px ${insets[OverlaySide.LEFT]}px`;
};

export const getOldestOverlay = (
    overlays: Array<OverlayRecord>,
): OverlayRecord => {
    let oVal = Infinity;
    let oIndex = 0;

    for (let i = 0; i < overlays.length; i++) {
        const o = overlays[i];

        if (o.createdAt < oVal) {
            oVal = o.createdAt;
            oIndex = i;
        }
    }

    return overlays[oIndex];
};

export const getNOldestOverlays = (
    overlays: Array<OverlayRecord>,
    n: number,
): Array<OverlayRecord> => {
    const sorted = overlays.sort((a, b) => {
        return a.createdAt - b.createdAt;
    });
    return sorted.slice(0, n);
};
