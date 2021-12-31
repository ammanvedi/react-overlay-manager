import {
    ConstraintViolationCallback,
    InsetRect,
    MatchMediaRecord,
    OverlayContextType,
    OverlayId,
    OverlayLayoutStore,
    OverlayPosition,
    OverlayRecord,
    OverlaySide,
    OverlaySideInsetStore,
    OverlayStore,
    PositionConstraintMaxItems,
    PositionConstraints,
    ResponsiveConstraints,
    ResponsiveRules,
    ViolationReactionType,
} from '../types';
import { MutableRefObject } from 'react';

/**
 * The main key assumption we can make here is that the
 * overlays in the store are already sorted in precedence order
 */
export const overlayExists = (
    id: string,
    store: OverlayStore,
): false | OverlayRecord => {
    return store.get(id) || false;
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
        const resConfig = responsiveRules[overlay.position.original];

        const destinationPosition =
            (resConfig
                ? getConfigForMatchMedia(resConfig)?.position
                : overlay.position.original) || overlay.position.original;

        addToLayoutStore(result, destinationPosition, overlay, overlayStore);
    });

    for (const [position, elements] of result) {
        elements.forEach((el) => {
            requestPlaceInDOMContainer(el, position);
        });
    }

    return result;
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

export const insertAtCorrectPosition = (
    id: OverlayId,
    container: HTMLElement,
    element: HTMLElement,
    desiredOrder: Array<OverlayId>,
) => {
    const index = desiredOrder.findIndex((orderedId) => orderedId === id);
    if (index === -1) {
        return;
    }

    if (index === desiredOrder.length - 1) {
        container.appendChild(element);
        return;
    }

    const nextId = desiredOrder[index + 1];

    container.insertBefore(element, container.querySelector(`#${nextId}`));
};

export const getUniqueCreationTimestamp: () => number = (() => {
    let i = 0;

    return () => {
        return ++i;
    };
})();

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

export const evaluateConstraints = (
    overlayStore: OverlayStore,
    overlayLayoutStore: MutableRefObject<OverlayLayoutStore>,
    onConstraintViolation: ConstraintViolationCallback,
    overlayElement: HTMLElement,
    removeOverlay: OverlayContextType['removeOverlay'],
    responsiveConfig: ResponsiveRules,
): Promise<any> => {
    return Promise.all(
        Object.values(OverlayPosition).reduce((acc, pos) => {
            const rConf = responsiveConfig[pos];

            if (!rConf) {
                return acc;
            }

            const matchingConf = getConfigForMatchMedia(rConf);

            if (!matchingConf) {
                return acc;
            }

            return [
                ...acc,
                ...evaluateConstraintsForPosition(
                    pos,
                    overlayStore,
                    overlayLayoutStore,
                    onConstraintViolation,
                    overlayElement,
                    removeOverlay,
                    matchingConf.constraints,
                ),
            ];
        }, [] as Array<Promise<any>>),
    );
};

export const handleMaxItemsConstraint = (
    constraint: PositionConstraintMaxItems,
    position: OverlayPosition,
    overlayStore: OverlayStore,
    overlayLayoutStore: MutableRefObject<OverlayLayoutStore>,
    onConstraintViolation: ConstraintViolationCallback,
    removeOverlay: OverlayContextType['removeOverlay'],
): Array<Promise<void>> => {
    const overlaysInPosition = overlayLayoutStore.current.get(position);

    if (!overlaysInPosition) {
        return [];
    }

    if (overlaysInPosition.length <= constraint.max) {
        return [];
    }

    const overlays = overlaysInPosition.map((o) =>
        overlayStore.get(o),
    ) as Array<OverlayRecord>;

    const action = onConstraintViolation({
        overlays,
        violationPosition: position,
    });

    const overflowCount = overlaysInPosition.length - constraint.max;

    switch (action.type) {
        case ViolationReactionType.NO_ACTION:
            return [];
        case ViolationReactionType.REMOVE_IDS:
            return action.ids.map((id) => {
                const cb =
                    overlayStore.get(id)?.onRemovedAfterConstraintViolation;

                return removeOverlay(id).then(() => {
                    if (cb) {
                        cb(id);
                    }
                });
            });
        case ViolationReactionType.REMOVE_OLDEST_AUTO:
            return getNOldestOverlays(overlays, overflowCount).map((o) => {
                const cb = overlayStore.get(
                    o.id,
                )?.onRemovedAfterConstraintViolation;

                return removeOverlay(o.id).then(() => {
                    if (cb) {
                        cb(o.id);
                    }
                });
            });
        default:
            return [];
    }
};

export const evaluateConstraintsForPosition = (
    position: OverlayPosition,
    overlayStore: OverlayStore,
    overlayLayoutStore: MutableRefObject<OverlayLayoutStore>,
    onConstraintViolation: ConstraintViolationCallback,
    overlayElement: HTMLElement,
    removeOverlay: OverlayContextType['removeOverlay'],
    constraints: ResponsiveConstraints['constraints'],
): Array<Promise<void>> => {
    if (!constraints) {
        return [];
    }

    const promises: Array<Promise<void>> = [];

    for (let i = 0; i < constraints.length; i++) {
        const constraint = constraints[i];

        switch (constraint.type) {
            case PositionConstraints.MAX_ITEMS:
                promises.push(
                    ...handleMaxItemsConstraint(
                        constraint,
                        position,
                        overlayStore,
                        overlayLayoutStore,
                        onConstraintViolation,
                        removeOverlay,
                    ),
                );
        }
    }

    return promises;
};
