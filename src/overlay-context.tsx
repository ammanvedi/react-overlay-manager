import React, { createContext, useCallback, useRef, useEffect } from 'react';
import {
    OverlayContextType,
    OverlayError,
    OverlayId,
    OverlayLayoutStore,
    OverlayRecord,
    OverlayStore,
} from './types';
import {
    BASE_LAYOUT,
    DEFAULT_PORTAL_WRAPPER_ID,
    DEFAULT_PORTAL_WRAPPER_TAG,
    DEFAULT_RESPONSIVE_RULES,
} from './constants';
import {
    addToBodyAndRemoveOld,
    createElementWithId,
    createElementWithInnerHTML,
    getContainerForPosition,
} from './helper/dom';
import throttle from 'lodash.throttle';
import {
    getNewLayoutStore,
    overlayExists,
    putOverlaysInContainers,
    removeOverlayFromList,
} from './helper/layout';

const overlayContextDefaultValue: OverlayContextType = Object.freeze({
    unregisterOverlay: () => null,
    registerOverlay: () => document.createElement('div'),
    updateOverlayRect: () => null,
    safeArea: null,
});

export const OverlayContext = createContext<OverlayContextType>(
    overlayContextDefaultValue,
);

export interface OverlayContextProviderProps {
    rootId?: string;
}

export const OverlayContextProvider: React.FC<OverlayContextProviderProps> = ({
    children,
    rootId = DEFAULT_PORTAL_WRAPPER_ID,
}) => {
    const overlayLayoutStoreRef = useRef<OverlayLayoutStore>(
        getNewLayoutStore(),
    );
    const { current: overlayLayoutStore } = overlayLayoutStoreRef;
    const { current: overlayStore } = useRef<OverlayStore>(new Map());
    const { current: elementRef } = useRef(
        addToBodyAndRemoveOld(
            createElementWithInnerHTML('div', rootId, BASE_LAYOUT),
            rootId,
        ),
    );

    const registerOverlay: OverlayContextType['registerOverlay'] = useCallback(
        (overlay) => {
            if (overlayExists(overlay.id, overlayStore)) {
                throw new Error(OverlayError.OVERLAY_EXISTS_ALREADY);
            }

            /**
             * Each overlay is rendered into its own portal, this gives us the
             * flexibility to stay in react world but also to be able to render
             * an overlay from wherever we want to in our application.
             *
             * This portal needs a dom element to render into. Here is where we create
             * that dom element. We will keep a reference to this element and then
             * move it into another container for the purposes of styling and to keep
             * the DOM neat
             */
            const portalContainerForOverlay = createElementWithId(
                DEFAULT_PORTAL_WRAPPER_TAG,
                overlay.id,
            );

            const overlayRecord: OverlayRecord = {
                ...overlay,
                element: portalContainerForOverlay,
                rect: null,
                translation: null,
            };

            overlayStore.set(overlay.id, overlayRecord);
            return portalContainerForOverlay;
        },
        [],
    );

    const unregisterOverlay: OverlayContextType['unregisterOverlay'] =
        useCallback((position, id) => {
            if (overlayExists(id, overlayStore)) {
                overlayLayoutStore.set(
                    position,
                    removeOverlayFromList(
                        id,
                        overlayLayoutStore.get(position) as Array<OverlayId>,
                        overlayStore,
                    ),
                );
                overlayStore.delete(id);
            }
        }, []);

    const recalculateLayout = useCallback(
        throttle(
            () => {
                overlayLayoutStoreRef.current = putOverlaysInContainers(
                    overlayStore,
                    DEFAULT_RESPONSIVE_RULES,
                    (id, position) => {
                        const container = getContainerForPosition(position);
                        const overlay = overlayStore.get(id);
                        if (container && overlay) {
                            container.appendChild(overlay.element);
                        }
                    },
                );
            },
            1000,
            { leading: true, trailing: true },
        ),
        [],
    );

    useEffect(() => {
        const onResize = () => recalculateLayout();
        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, []);

    const updateOverlayRect: OverlayContextType['updateOverlayRect'] =
        useCallback((id, rect) => {
            const overlay = overlayStore.get(id);
            if (overlay) {
                overlayStore.set(id, {
                    ...overlay,
                    rect,
                });

                recalculateLayout();
            }
        }, []);

    return (
        <OverlayContext.Provider
            value={{
                safeArea: null,
                registerOverlay,
                unregisterOverlay,
                updateOverlayRect,
            }}
        >
            {children}
        </OverlayContext.Provider>
    );
};
