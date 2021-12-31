import React, { createContext, useRef, useEffect } from 'react';
import {
    ConstraintViolationCallback,
    OverlayContextType,
    ResponsiveRules,
} from './types';
import {
    DEFAULT_CONSTRAINT_VIOLATION_CALLBACK,
    DEFAULT_PORTAL_WRAPPER_ID,
    DEFAULT_PORTAL_WRAPPER_TAG,
    DEFAULT_RESPONSIVE_RULES,
} from './constants';
import { OverlayState } from './lib/overlay-state';

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
    const { current: overlayState } = useRef(
        new OverlayState(rootId, responsiveRules, (...args) => {
            return onConstraintViolation(...args);
        }),
    );

    console.log(overlayState);

    useEffect(() => {
        const onResize = () => {
            overlayState.recalculateLayout();
            overlayState.recalculateInsets();
        };
        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return (
        <OverlayContext.Provider
            value={{
                safeArea: null,
                registerOverlay:
                    overlayState.registerOverlay.bind(overlayState),
                unregisterOverlay:
                    overlayState.unregisterOverlay.bind(overlayState),
                updateOverlayRecord:
                    overlayState.updateOverlay.bind(overlayState),
                setInset: overlayState.setInset.bind(overlayState),
                removeInset: overlayState.removeInset.bind(overlayState),
                recalculateInsets:
                    overlayState.recalculateInsets.bind(overlayState),
                setOverlayReady:
                    overlayState.setOverlayReady.bind(overlayState),
                clear: overlayState.reset.bind(overlayState),
                removeOverlay: overlayState.removeOverlay.bind(overlayState),
            }}
        >
            {children}
        </OverlayContext.Provider>
    );
};
