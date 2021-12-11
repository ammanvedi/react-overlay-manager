import React, {
    createContext,
    useCallback,
    useLayoutEffect,
    useRef,
} from 'react';
import { OverlayContextType, OverlayPosition } from './types';
import {
    DEFAULT_PORTAL_WRAPPER_ID,
    getPortalWrapperIdForPosition,
} from './constants';
import { createElementWithId } from './dom';

const overlayContextDefaultValue: OverlayContextType = Object.freeze({
    getRootForPosition: () => null,
    safeArea: null,
});

export const OverlayContext = createContext<OverlayContextType>(
    overlayContextDefaultValue,
);

export interface OverlayContextProviderProps {
    rootId: string;
}

export interface ElementRefs {
    root: HTMLDivElement;
    top: HTMLDivElement;
    bottom: HTMLDivElement;
}

export const OverlayContextProvider: React.FC<OverlayContextProviderProps> = ({
    children,
    rootId = DEFAULT_PORTAL_WRAPPER_ID,
}) => {
    const elementRefs = useRef<ElementRefs>({
        root: createElementWithId('div', rootId),
        bottom: createElementWithId(
            'div',
            getPortalWrapperIdForPosition(OverlayPosition.BOTTOM, rootId),
        ),
        top: createElementWithId(
            'div',
            getPortalWrapperIdForPosition(OverlayPosition.TOP, rootId),
        ),
    });

    useLayoutEffect(() => {
        /**
         * Actually add the elements to the dom. We append them so that in most
         * cases there is a reasonable chance we can overlay all the items on top of
         * the ui without needing any css tricks.
         */
        document.body.appendChild(elementRefs.current.root);

        /**
         * Within the root there is a section for content that needs to be top positioned
         * and for content that needs to be bottom positioned
         */
        elementRefs.current.root.append(
            elementRefs.current.top,
            elementRefs.current.bottom,
        );

        /**
         * TODO
         *
         * run example in storybook
         * see if it works
         * add resize observer to each entity and add functions to pass client rect up tree
         * work out how to calculate the safe area
         * add ability to add a defined z index
         * work out how to position the elements properly in order of defined z index
         * define what the safe area actually is
         *  - is it a polygon, or is it a box, what if elements have different widths
         */
    }, []);

    const getRootForPosition: OverlayContextType['getRootForPosition'] =
        useCallback((position) => {
            switch (position) {
                case OverlayPosition.BOTTOM:
                    return elementRefs.current.bottom;
                case OverlayPosition.TOP:
                    return elementRefs.current.top;
                default:
                    return null;
            }
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
