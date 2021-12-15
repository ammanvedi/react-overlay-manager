import React, {
    createContext,
    useCallback,
    useLayoutEffect,
    useRef,
} from 'react';
import * as Styles from './styles';
import {
    OverlayContextType,
    OverlayError,
    OverlayId,
    OverlayLayoutStore,
    OverlayPosition,
    OverlayRecord,
    OverlayStore,
} from './types';
import {
    DEFAULT_PORTAL_WRAPPER_ID,
    DEFAULT_PORTAL_WRAPPER_TAG,
} from './constants';
import { createElement } from './helper/dom';
import debounce from 'lodash.debounce';
import {
    calculateLayout,
    insertOverlayIntoList,
    overlayExists,
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
    const { current: overlayLayoutStore } = useRef<OverlayLayoutStore>(
        new Map(Object.values(OverlayPosition).map((op) => [op, []])),
    );
    const { current: overlayStore } = useRef<OverlayStore>(new Map());
    const { current: elementRef } = useRef(
        createElement('div', rootId, Styles.Wrapper),
    );

    useLayoutEffect(() => {
        const oldRoot = document.getElementById(rootId);

        if (oldRoot) {
            oldRoot.remove();
        }
        /**
         * Actually add the elements to the dom. We append them so that in most
         * cases there is a reasonable chance we can overlay all the items on top of
         * the ui without needing any css tricks.
         */
        document.body.appendChild(elementRef);

        /**
         * TODO
         *
         * run example in storybook
         * see if it works
         * add resize observer to each entity and add functions to pass client rect up tree
         * work out how to calculate the safe area
         * add ability to add a defined z index
         * work out how to position the elements properly in order of defined y? index
         * define what the safe area actually is
         *  - is it a polygon, or is it a box, what if elements have different widths
         */
    }, []);

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
            const portalContainerForOverlay = createElement(
                DEFAULT_PORTAL_WRAPPER_TAG,
                overlay.id,
                Styles.WrapperOverlay,
            );

            const overlayRecord: OverlayRecord = {
                ...overlay,
                element: portalContainerForOverlay,
                rect: null,
                translation: null,
            };

            overlayStore.set(overlay.id, overlayRecord);

            /**
             * Insert the id into the correct position in the layout
             */
            console.log('inserting', overlay.id, 'into', overlay.position);
            overlayLayoutStore.set(
                overlay.position,
                insertOverlayIntoList(
                    overlayRecord,
                    overlayLayoutStore.get(
                        overlay.position,
                    ) as Array<OverlayId>,
                    overlayStore,
                ),
            );

            elementRef.append(portalContainerForOverlay);

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
        debounce(() => {
            console.log('Will calculate Layout');
            console.log(overlayLayoutStore);
            console.log(overlayStore);
            const recalculationResult = calculateLayout(
                elementRef.getBoundingClientRect(),
                overlayLayoutStore,
                overlayStore,
            );
            console.log(recalculationResult);
        }, 500),
        [],
    );

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
