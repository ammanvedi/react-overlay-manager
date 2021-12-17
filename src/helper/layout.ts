import {
    MatchMediaRecord,
    OverlayId,
    OverlayLayoutStore,
    OverlayPosition,
    OverlayRecord,
    OverlayStore,
    ResponsiveRules,
} from '../types';

/**
 * The main key assumption we can make here is that the
 * overlays in the store are already sorted in precedence order
 */
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

export const getNewLayoutStore = (): OverlayLayoutStore =>
    new Map(
        Object.values(OverlayPosition).map((op) => [
            op,
            [] as Array<OverlayId>,
        ]),
    );

export const getPositionForMatchMedia = (
    record: MatchMediaRecord | null,
): OverlayPosition | null => {
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

export const putOverlaysInContainers = (
    overlayStore: OverlayStore,
    responsiveRules: ResponsiveRules,
    requestPlaceInDOMContainer: (
        id: OverlayId,
        position: OverlayPosition,
    ) => void,
): OverlayLayoutStore => {
    // TODO - if we approach the problem like this
    // it is probably better to do a logn sort on the above
    // as the reasoning above probably doesnt make sense any more

    const result: OverlayLayoutStore = getNewLayoutStore();
    overlayStore.forEach((overlay) => {
        const destinationPosition =
            getPositionForMatchMedia(responsiveRules[overlay.position]) ||
            overlay.position;

        requestPlaceInDOMContainer(overlay.id, destinationPosition);
        addToLayoutStore(result, destinationPosition, overlay, overlayStore);
    });

    return result;
};
