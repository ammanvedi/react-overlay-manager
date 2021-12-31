import React, { createContext, useCallback, useRef, useEffect } from 'react';
import {
    ConstraintViolationCallback,
    OverlayContextType,
    OverlayId,
    OverlayLayoutStore,
    OverlayPosition,
    OverlayRecord,
    OverlaySideInsetStore,
    OverlayStore,
    ResponsiveRules,
} from './types';
import {
    BASE_LAYOUT,
    DEFAULT_CONSTRAINT_VIOLATION_CALLBACK,
    DEFAULT_PORTAL_WRAPPER_ID,
    DEFAULT_PORTAL_WRAPPER_TAG,
    DEFAULT_RESPONSIVE_RULES,
    ID_MAP,
    noop,
} from './constants';
import {
    addToBodyAndRemoveOld,
    animateElementIn,
    animateElementOut,
    createElementWithId,
    createElementWithInnerHTML,
    getContainerForPosition,
    getFinalWidth,
    getWidthReference,
} from './helper/dom';
import debounce from 'lodash.debounce';
import {
    applyInsets,
    evaluateConstraints,
    getInsets,
    getNewInsetStore,
    getNewLayoutStore,
    getUniqueCreationTimestamp,
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
    removeOverlay: () => Promise.resolve(),
});

export const OverlayContext = createContext<OverlayContextType>(
    overlayContextDefaultValue,
);

export interface OverlayContextProviderProps {
    /**
     * The id used as a base to generate ids for the overlay
     * components we will create
     */
    rootId?: string;
    /**
     * Define how overlays move around when the screen size changes
     */
    responsiveRules?: ResponsiveRules;
    /**
     * A callback that will be invoked when the addition of this overlay has caused the
     * parent container to overflow the view. The implementor can then decide what
     * action to take.
     */
    onConstraintViolation?: ConstraintViolationCallback;
}

export const OverlayContextProvider: React.FC<OverlayContextProviderProps> = ({
    children,
    rootId = DEFAULT_PORTAL_WRAPPER_ID,
    responsiveRules = DEFAULT_RESPONSIVE_RULES,
    onConstraintViolation = DEFAULT_CONSTRAINT_VIOLATION_CALLBACK,
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
     *
     */
    const overlayLayoutStore = useRef<OverlayLayoutStore>(getNewLayoutStore());
    const overlaySideInsetStore = useRef<OverlaySideInsetStore>(
        getNewInsetStore(),
    );
    const overlayStore = useRef<OverlayStore>(new Map());
    const rootElement = useRef(
        addToBodyAndRemoveOld(
            createElementWithInnerHTML('div', rootId, BASE_LAYOUT),
            rootId,
        ),
    );
    const containerElement = useRef(document.getElementById(ID_MAP.container));

    // done
    const registerOverlay: OverlayContextType['registerOverlay'] = useCallback(
        (overlay) => {
            const existingOverlay = overlayExists(
                overlay.id,
                overlayStore.current,
            );
            if (existingOverlay) {
                return existingOverlay.element;
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
                element: portalContainerForOverlay,
                createdAt: getUniqueCreationTimestamp(),
                onRemovedAfterConstraintViolation:
                    overlay.onRemovedAfterConstraintViolation || noop,
                position: {
                    original: overlay.position as Readonly<OverlayPosition>,
                    current: null,
                    desired: null,
                },
            };

            overlayStore.current.set(overlay.id, overlayRecord);

            return portalContainerForOverlay;
        },
        [],
    );

    // done
    const removeOverlay: OverlayContextType['removeOverlay'] = useCallback(
        async (id) => {
            const overlay = overlayExists(id, overlayStore.current);

            if (overlay) {
                await animateElementOut(
                    overlay.element,
                    getWidthReference(overlay.element),
                    getFinalWidth(overlay.position.current),
                    0,
                );
                unregisterOverlay(id);
            }
        },
        [],
    );

    // done
    const unregisterOverlay: OverlayContextType['unregisterOverlay'] =
        useCallback((id) => {
            const overlay = overlayExists(id, overlayStore.current);
            if (overlay && overlay.position.current) {
                overlayLayoutStore.current.set(
                    overlay.position.current,
                    removeOverlayFromList(
                        id,
                        overlayLayoutStore.current.get(
                            overlay.position.current,
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
            let inCount = 0;
            let outCount = 0;
            const animationPromises: Array<Promise<void>> = [];
            overlayLayoutStore.current = putOverlaysInContainers(
                overlayStore.current,
                responsiveRules,
                (id: OverlayId, position: OverlayPosition) => {
                    const container = getContainerForPosition(position);
                    const overlay = overlayStore.current.get(id);

                    if (!container || !overlay) {
                        return;
                    }

                    overlay.position.desired = position;

                    /**
                     * If the mount point is going to change then animate the
                     * element out
                     */
                    const hasBeenMountedToDom =
                        overlay.position.current !== null;

                    if (!hasBeenMountedToDom) {
                        container.appendChild(overlay.element);
                    }

                    const mountPointChanged =
                        overlay.position.current !== overlay.position.desired;

                    if (mountPointChanged) {
                        if (overlay.position.current === null) {
                            container.appendChild(overlay.element);
                            animationPromises.push(
                                animateElementIn(
                                    overlay.element,
                                    getWidthReference(overlay.element),
                                    getFinalWidth(overlay.position.desired),
                                    inCount * 20,
                                ).then(() => {
                                    overlay.position.current = position;
                                }),
                            );
                            inCount++;
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
                                animateElementOut(
                                    overlay.element,
                                    getWidthReference(overlay.element),
                                    getFinalWidth(overlay.position.desired),
                                    outCount * 20,
                                )
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

                                        _overlay.position.current = position;

                                        insertAtCorrectPosition(
                                            _overlay.id,
                                            container,
                                            _overlay.element,
                                            overlayLayoutStore.current.get(
                                                position,
                                            ) || [],
                                        );

                                        return Promise.resolve(_overlay);
                                    })
                                    .then((_overlay) => {
                                        if (!_overlay) {
                                            return;
                                        }
                                        animateElementIn(
                                            _overlay.element,
                                            getWidthReference(_overlay.element),
                                            getFinalWidth(
                                                _overlay.position.desired,
                                            ),
                                            inCount * 20,
                                        );
                                    }),
                            );
                            outCount++;
                            inCount++;
                        }

                        return;
                    } else {
                        container.appendChild(overlay.element);
                    }
                },
            );

            return Promise.all([
                ...animationPromises,
                evaluateConstraints(
                    overlayStore.current,
                    overlayLayoutStore,
                    onConstraintViolation,
                    rootElement.current,
                    removeOverlay,
                    responsiveRules,
                ),
            ]);
        }, 500),
        [],
    );

    // done
    const recalculateInsets = useCallback(
        debounce(
            () => {
                if (containerElement.current) {
                    const newInsets = getInsets(overlaySideInsetStore.current);
                    applyInsets(containerElement.current, newInsets);
                }
            },
            300,
            { leading: true, trailing: true },
        ),
        [],
    );

    // done -. reset
    const clear = useCallback(() => {
        overlayLayoutStore.current = getNewLayoutStore();
        overlaySideInsetStore.current = getNewInsetStore();
        overlayStore.current = new Map();
        containerElement.current = document.getElementById(ID_MAP.container);
        rootElement.current = addToBodyAndRemoveOld(
            createElementWithInnerHTML('div', rootId, BASE_LAYOUT),
            rootId,
        );
    }, []);

    // done
    const setInset: OverlayContextType['setInset'] = useCallback((inset) => {
        overlaySideInsetStore.current.set(inset.id, inset);
        recalculateInsets();
    }, []);

    //done
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

    // done
    const updateOverlayRecord: OverlayContextType['updateOverlayRecord'] =
        useCallback(({ id, ...newRecord }) => {
            const overlay = overlayStore.current.get(id);
            if (overlay) {
                /**
                 * Its important here that we dont change the reference to the
                 * object by creating a new one!
                 */
                overlay.priority = newRecord.priority;
                overlay.onRemovedAfterConstraintViolation =
                    newRecord.onRemovedAfterConstraintViolation || noop;
                overlay.position.desired = newRecord.position;
                overlay.position.original = newRecord.position;

                recalculateLayout();
            }
        }, []);

    // done
    const setOverlayReady: OverlayContextType['setOverlayReady'] = useCallback(
        (id) => {
            const overlay = overlayExists(id, overlayStore.current);

            if (overlay) {
                recalculateLayout();

                if (!overlay.hideAfterMs) {
                    return;
                }

                setTimeout(() => {
                    removeOverlay(id);
                }, overlay.hideAfterMs);
            }
        },
        [],
    );

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
                removeOverlay,
            }}
        >
            {children}
        </OverlayContext.Provider>
    );
};
