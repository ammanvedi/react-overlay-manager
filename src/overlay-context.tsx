import React, { createContext, useCallback, useRef, useEffect } from 'react';
import {
    OverlayContextType,
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
    getFinalWidth,
} from './helper/dom';
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
} from './helper/layout';
import { createScheduledFunction } from './helper/scheduler';

const overlayContextDefaultValue: OverlayContextType = Object.freeze({
    unregisterOverlay: () => null,
    registerOverlay: () => document.createElement('div'),
    updateOverlayRecord: () => null,
    removeInset: () => null,
    setInset: () => null,
    recalculateInsets: () => null,
    setOverlayReady: () => null,
    clear: () => null,
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
     * It might be easier to read as i think a-lot of the useRef and
     * useCallback is actually a layer of indirection we maybe dont need
     */
    const overlayLayoutStore = useRef<OverlayLayoutStore>(getNewLayoutStore());
    const overlaySideInsetStore = useRef<OverlaySideInsetStore>(
        getNewInsetStore(),
    );
    const overlayStore = useRef<OverlayStore>(new Map());
    const elementRef = useRef(
        addToBodyAndRemoveOld(
            createElementWithInnerHTML('div', rootId, BASE_LAYOUT),
            rootId,
        ),
    );
    const containerRef = useRef(document.getElementById(ID_MAP.container));

    const registerOverlay: OverlayContextType['registerOverlay'] = useCallback(
        (overlay) => {
            const existingOverlay = overlayExists(
                overlay.id,
                overlayStore.current,
            );
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

            overlayStore.current.set(overlay.id, overlayRecord);

            return portalContainerForOverlay;
        },
        [],
    );

    const unregisterOverlay: OverlayContextType['unregisterOverlay'] =
        useCallback((position, id) => {
            if (overlayExists(id, overlayStore.current)) {
                overlayLayoutStore.current.set(
                    position,
                    removeOverlayFromList(
                        id,
                        overlayLayoutStore.current.get(
                            position,
                        ) as Array<OverlayId>,
                        overlayStore.current,
                    ),
                );
                overlayStore.current.delete(id);
            }
        }, []);

    const recalculateLayout = useCallback(
        createScheduledFunction(() => {
            /**
             * First we place all divs into the correct containers
             */
            const animationPromises: Array<Promise<void>> = [];
            overlayLayoutStore.current = putOverlaysInContainers(
                overlayStore.current,
                DEFAULT_RESPONSIVE_RULES,
                (id: OverlayId, position: OverlayPosition) => {
                    const container = getContainerForPosition(position);
                    const overlay = overlayStore.current.get(id);

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
                                animateElementIn(
                                    overlay.element,
                                    getFinalWidth(overlay),
                                ),
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
                                        /**
                                         * We need to update the reference to the object we have here because
                                         * the reference might be changed elsewhere and this is an async operation
                                         * so some time will have passed between
                                         */
                                        const _overlay =
                                            overlayStore.current.get(id);

                                        if (!_overlay) {
                                            return;
                                        }

                                        _overlay.currentMountedPosition =
                                            position;

                                        insertAtCorrectPosition(
                                            _overlay.id,
                                            container,
                                            _overlay.element,
                                            overlayLayoutStore.current.get(
                                                position,
                                            ) || [],
                                        );
                                    })
                                    .then(() =>
                                        animateElementIn(
                                            overlay.element,
                                            getFinalWidth(overlay),
                                        ),
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
        }, 500),
        [],
    );

    const recalculateInsets = useCallback(
        debounce(
            () => {
                if (containerRef.current) {
                    const newInsets = getInsets(overlaySideInsetStore.current);
                    applyInsets(containerRef.current, newInsets);
                }
            },
            300,
            { leading: true, trailing: true },
        ),
        [],
    );

    const clear = useCallback(() => {
        overlayLayoutStore.current = getNewLayoutStore();
        overlaySideInsetStore.current = getNewInsetStore();
        overlayStore.current = new Map();
        containerRef.current = document.getElementById(ID_MAP.container);
        elementRef.current = addToBodyAndRemoveOld(
            createElementWithInnerHTML('div', rootId, BASE_LAYOUT),
            rootId,
        );
    }, []);

    const setInset: OverlayContextType['setInset'] = useCallback((inset) => {
        overlaySideInsetStore.current.set(inset.id, inset);
        recalculateInsets();
    }, []);

    const removeInset: OverlayContextType['removeInset'] = useCallback(
        (insetId) => {
            overlaySideInsetStore.current.delete(insetId);
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
            const overlay = overlayStore.current.get(id);
            if (overlay) {
                overlayStore.current.set(id, {
                    ...overlay,
                    ...newRecord,
                });

                recalculateLayout();
            }
        }, []);

    const setOverlayReady: OverlayContextType['setOverlayReady'] =
        useCallback(() => {
            recalculateLayout();
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
                setOverlayReady,
                clear,
            }}
        >
            {children}
        </OverlayContext.Provider>
    );
};
