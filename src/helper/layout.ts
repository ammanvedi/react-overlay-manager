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
    ResponsiveRules,
} from '../types';
import throttle from 'lodash.throttle';

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

/**
 * The aim of this function is to take an input function and return a function
 * that can only be called;
 * 1. once every x milliseconds
 * 2. cannot be called while the promise that the function returns is unsettled
 */
export const throttleWithPromiseBlocking = <PROMISE_TYPE>(
    fn: () => Promise<PROMISE_TYPE>,
    throttleInterval: number,
): (() => Promise<PROMISE_TYPE>) => {
    return (() => {
        let currentPromise: Promise<PROMISE_TYPE> | null = null;
        let didCallWhenPromiseUnresolved = false;

        const internalFunc = () => {
            if (currentPromise) {
                console.log('has current promise');
                didCallWhenPromiseUnresolved = true;
                return Promise.resolve();
            }

            currentPromise = fn().then((result) => {
                currentPromise = null;
                if (didCallWhenPromiseUnresolved) {
                    didCallWhenPromiseUnresolved = false;
                    currentPromise = fn();
                }

                return result;
            });

            return currentPromise;
        };

        return throttle(internalFunc, throttleInterval, {
            trailing: true,
            leading: false,
        }) as () => Promise<PROMISE_TYPE>;
    })();
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
