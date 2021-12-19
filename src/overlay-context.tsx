import React, { createContext, useCallback, useRef, useEffect } from 'react';
import {
    OverlayContextType,
    OverlayError,
    OverlayId,
    OverlayLayoutStore,
    OverlayPosition,
    OverlayRecord,
    OverlaySideInsetStore,
    OverlayStore,
} from './types';
import {
    BASE_LAYOUT,
    DEFAULT_PORTAL_WRAPPER_ID,
    DEFAULT_PORTAL_WRAPPER_TAG,
    DEFAULT_RESPONSIVE_RULES,
    ID_MAP,
} from './constants';
import {
    addToBodyAndRemoveOld,
    animateElementIn,
    animateElementOut,
    createElementWithId,
    createElementWithInnerHTML,
    getContainerForPosition,
} from './helper/dom';
import throttle from 'lodash.throttle';
import debounce from 'lodash.debounce';
import {
    applyInsets,
    getInsets,
    getNewInsetStore,
    getNewLayoutStore,
    insertAtCorrectPosition,
    overlayExists,
    putOverlaysInContainers,
    removeOverlayFromList,
    throttleWithPromiseBlocking,
} from './helper/layout';

const overlayContextDefaultValue: OverlayContextType = Object.freeze({
    unregisterOverlay: () => null,
    registerOverlay: () => document.createElement('div'),
    updateOverlayRecord: () => null,
    removeInset: () => null,
    setInset: () => null,
    recalculateInsets: () => null,
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
    /**
     * TODO
     *
     * All of this logic is essentially just functions updating the
     * values of instance variables (refs) we could throw this all in a
     * class and just instance that.
     *
     * It might be easier to read as i think alot of the useref and
     * usecallback is actually a layer of indirection we maybe dont need
     */
    const overlayLayoutStoreRef = useRef<OverlayLayoutStore>(
        getNewLayoutStore(),
    );
    const { current: overlaySideInsetStore } = useRef<OverlaySideInsetStore>(
        getNewInsetStore(),
    );
    const { current: overlayLayoutStore } = overlayLayoutStoreRef;
    const { current: overlayStore } = useRef<OverlayStore>(new Map());
    const { current: elementRef } = useRef(
        addToBodyAndRemoveOld(
            createElementWithInnerHTML('div', rootId, BASE_LAYOUT),
            rootId,
        ),
    );
    const { current: containerRef } = useRef<HTMLElement>(
        document.getElementById(ID_MAP.container),
    );

    const registerOverlay: OverlayContextType['registerOverlay'] = useCallback(
        (overlay) => {
            const existingOverlay = overlayExists(overlay.id, overlayStore);
            if (existingOverlay) {
                return existingOverlay.element;
                //throw new Error(OverlayError.OVERLAY_EXISTS_ALREADY);
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
                'overlay-wrapper',
            );

            const overlayRecord: OverlayRecord = {
                ...overlay,
                currentMountedPosition: null,
                element: portalContainerForOverlay,
                rect: null,
                translation: null,
            };

            overlayStore.set(overlay.id, overlayRecord);
            recalculateLayout();
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
        throttleWithPromiseBlocking(() => {
            console.log('recalc');
            /**
             * First we place all divs into the correct containers
             */
            const animationPromises: Array<Promise<void>> = [];
            overlayLayoutStoreRef.current = putOverlaysInContainers(
                overlayStore,
                DEFAULT_RESPONSIVE_RULES,
                (id: OverlayId, position: OverlayPosition) => {
                    const container = getContainerForPosition(position);
                    const overlay = overlayStore.get(id);

                    if (!container || !overlay) {
                        return;
                    }

                    /**
                     * If the mount point is going to change then animate the
                     * element out
                     */
                    const hasBeenMountedToDom =
                        overlay.currentMountedPosition !== null;

                    if (!hasBeenMountedToDom) {
                        container.appendChild(overlay.element);
                    }

                    const mountPointChanged =
                        overlay.currentMountedPosition !== position;

                    if (mountPointChanged) {
                        if (overlay.currentMountedPosition === null) {
                            overlay.currentMountedPosition = position;
                            container.appendChild(overlay.element);
                            animationPromises.push(
                                animateElementIn(overlay.element),
                            );
                        } else {
                            /**
                             * We can land in a funny situation here, we move an overlay
                             * from A to B, but it takes some time to animate out of being
                             * in A. Meanwhile we are adding more elements to B.
                             *
                             * If we were to just append the overlay to B it will be in the
                             * wrong place due to this asynchronous action.
                             *
                             * This is why we need to invoke the insert at correct position function
                             */
                            animationPromises.push(
                                animateElementOut(overlay.element)
                                    .then(() => {
                                        overlay.currentMountedPosition =
                                            position;

                                        insertAtCorrectPosition(
                                            overlay.id,
                                            container,
                                            overlay.element,
                                            overlayLayoutStoreRef.current.get(
                                                position,
                                            ) || [],
                                        );
                                    })
                                    .then(() =>
                                        animateElementIn(overlay.element),
                                    ),
                            );
                        }

                        return;
                    } else {
                        container.appendChild(overlay.element);
                    }
                },
            );
            return Promise.all(animationPromises);
        }, 1000),
        [],
    );

    const recalculateInsets = useCallback(
        debounce(
            () => {
                if (containerRef) {
                    const newInsets = getInsets(overlaySideInsetStore);
                    applyInsets(containerRef, newInsets);
                }
            },
            300,
            { leading: true, trailing: true },
        ),
        [],
    );

    const setInset: OverlayContextType['setInset'] = useCallback((inset) => {
        overlaySideInsetStore.set(inset.id, inset);
        recalculateInsets();
    }, []);

    const removeInset: OverlayContextType['removeInset'] = useCallback(
        (insetId) => {
            overlaySideInsetStore.delete(insetId);
        },
        [],
    );

    useEffect(() => {
        const onResize = () => {
            recalculateLayout();
            recalculateInsets();
        };
        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, []);

    const updateOverlayRecord: OverlayContextType['updateOverlayRecord'] =
        useCallback(({ id, ...newRecord }) => {
            const overlay = overlayStore.get(id);
            if (overlay) {
                overlayStore.set(id, {
                    ...overlay,
                    ...newRecord,
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
                updateOverlayRecord,
                setInset,
                removeInset,
                recalculateInsets,
            }}
        >
            {children}
        </OverlayContext.Provider>
    );
};
