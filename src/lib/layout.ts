import {
    InsetRect,
    InsetRectCalculation,
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
    return [...list, overlay.id].sort((a, b) => {
        const overlayA = overlays.get(a);
        const overlayB = overlays.get(b);

        if (!overlayA || !overlayB) {
            return 0;
        }

        if (overlayA.priority === overlayB.priority) {
            return overlayB.createdAt - overlayA.createdAt;
        }

        return overlayA.priority - overlayB.priority;
    });
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
    const result: InsetRectCalculation = {
        [OverlaySide.TOP]: {
            numeric: 0,
            ref: 0,
        },
        [OverlaySide.BOTTOM]: {
            numeric: 0,
            ref: 0,
        },
        [OverlaySide.LEFT]: {
            numeric: 0,
            ref: 0,
        },
        [OverlaySide.RIGHT]: {
            numeric: 0,
            ref: 0,
        },
    };

    for (const [
        _,
        { insetValue, side, extraPaddingPx },
    ] of insetStore.entries()) {
        let thisInset = 0;
        switch (typeof insetValue) {
            case 'number':
                result[side].numeric += insetValue + extraPaddingPx;
                break;
            case 'object':
                thisInset = insetValue
                    ? getInsetFromRef(insetValue, side, extraPaddingPx)
                    : 0;
                if (thisInset > result[side].ref) {
                    result[side].ref = thisInset;
                }
        }
    }

    return {
        [OverlaySide.TOP]: Math.max(
            result[OverlaySide.TOP].ref,
            result[OverlaySide.TOP].numeric,
        ),
        [OverlaySide.BOTTOM]: Math.max(
            result[OverlaySide.BOTTOM].ref,
            result[OverlaySide.BOTTOM].numeric,
        ),
        [OverlaySide.LEFT]: Math.max(
            result[OverlaySide.LEFT].ref,
            result[OverlaySide.LEFT].numeric,
        ),
        [OverlaySide.RIGHT]: Math.max(
            result[OverlaySide.RIGHT].ref,
            result[OverlaySide.RIGHT].numeric,
        ),
    };
};

export const applyInsets = (el: HTMLElement, insets: InsetRect) => {
    el.style.inset = `${insets[OverlaySide.TOP]}px ${
        insets[OverlaySide.RIGHT]
    }px ${insets[OverlaySide.BOTTOM]}px ${insets[OverlaySide.LEFT]}px`;
};

export const getNOldestOverlays = (
    overlays: Array<OverlayRecord>,
    n: number,
): Array<OverlayRecord> => {
    if (overlays.length <= n) {
        return [...overlays];
    }

    const sorted = [...overlays].sort((a, b) => {
        return a.createdAt - b.createdAt;
    });
    return sorted.slice(0, n);
};
