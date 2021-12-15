import {
    HorizontalPositionerFunction,
    LayoutCalculationResult,
    OverlayId,
    OverlayLayoutStore,
    OverlayRecord,
    OverlayStore,
    PositionerFunctions,
    SafeAreaRect,
} from '../types';

/**
 * We assume the coordinate system to be top left.
 * We assume the element is at rest in the container at the top left
 * and the transform we apply will move the container from the top
 * left to the correct position
 */
const centerHorizontal: HorizontalPositionerFunction = (
    initialOffset = 0,
    containerRect,
    elementRect,
) => {
    const result = (containerRect.width - elementRect.width) / 2;
    return {
        offset: result,
        additionalOffset: result,
    };
};

const leftHorizontal: HorizontalPositionerFunction = (
    initialOffset = 0,
    containerRect,
    elementRect,
) => {
    return {
        offset: 0,
        additionalOffset: 0,
    };
};

const rightHorizontal: HorizontalPositionerFunction = (
    initialOffset = 0,
    containerRect,
    elementRect,
) => {
    const result = containerRect.width - elementRect.width;

    return {
        offset: result,
        additionalOffset: result,
    };
};

const positionerFunctions: PositionerFunctions = {
    [OverlayPosition.TOP_FULL_WIDTH]: {},
};

/**
 * The main key assumption we can make here is that the
 * overlays in the store are already sorted in precedence order
 */
export const calculateLayout = (
    containerRect: DOMRect,
    layout: OverlayLayoutStore,
    overlays: OverlayStore,
): LayoutCalculationResult => {
    const safeArea: SafeAreaRect = {
        inset: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        },
    };
};

export const overlayExists = (id: string, store: OverlayStore): boolean => {
    return !!store.get(id);
};

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
    const result: Array<OverlayRecord> = [];

    for (let i = 0; i < list.length; i++) {
        const el = overlays.get(list[i]);

        if (el && el.priority >= overlay.priority) {
            return [...list.slice(0, i), overlay.id, ...list.slice(i)];
        }
    }

    return [overlay.id];
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
