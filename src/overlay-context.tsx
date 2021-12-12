import React, {
    createContext,
    useCallback,
    useLayoutEffect,
    useRef,
} from 'react';
import * as Styles from './styles';
import { OverlayContextType, OverlayPosition } from './types';
import {
    DEFAULT_PORTAL_WRAPPER_ID,
    getPortalWrapperIdForPosition,
} from './constants';
import {
    addStyles,
    createContainers,
    createElementWithId,
} from './dom-helpers';

const overlayContextDefaultValue: OverlayContextType = Object.freeze({
    getRootForPosition: () => null,
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
    const elementRefs = useRef<ReturnType<typeof createContainers>>(
        createContainers(rootId),
    );

    useLayoutEffect(() => {
        const oldRoot = document.getElementById(rootId);

        if (oldRoot) {
            // dfsf
            oldRoot.remove();
        }
        /**
         * Actually add the elements to the dom. We append them so that in most
         * cases there is a reasonable chance we can overlay all the items on top of
         * the ui without needing any css tricks.
         */
        document.body.appendChild(elementRefs.current.container);

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

    const getRootForPosition: OverlayContextType['getRootForPosition'] =
        useCallback((position) => {
            return elementRefs.current[position];
        }, []);

    return (
        <OverlayContext.Provider
            value={{
                safeArea: null,
                getRootForPosition,
            }}
        >
            {children}
        </OverlayContext.Provider>
    );
};
