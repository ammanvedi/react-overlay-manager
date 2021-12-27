import { createPortal } from 'react-dom';
import React, { useEffect, useContext, useRef } from 'react';
import { OverlayContextType, OverlayId, OverlayPosition } from './types';
import { OverlayContext } from './overlay-context';

export interface OverlayProps {
    id: OverlayId;
    position: OverlayPosition;
    priority: number;
}

export const Overlay: React.FC<OverlayProps> = ({
    /**
     * There should be a single child, the component that you need to overlay
     */
    children,
    /**
     * A unique ID for this overlay
     */
    id,
    /**
     * Where to render the component, for more information see the Positioning documentation
     */
    position,
    /**
     * The priority index of the component, for more information see the Priorities documentation
     */
    priority,
}) => {
    const {
        registerOverlay,
        unregisterOverlay,
        updateOverlayRecord,
        setOverlayReady,
    } = useContext<OverlayContextType>(OverlayContext);
    const { current: portalWrapper } = useRef<HTMLElement>(
        registerOverlay({
            id,
            position,
            priority,
        }),
    );

    /**
     * TODO ADD RESIZE OBSERVER
     */

    useEffect(() => {
        /**
         * It may take some time for react to place the portal in this
         * child element, so lets wait for that to happen and then trigger
         * a layout refresh.
         */
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (
                    mutation.type === 'childList' &&
                    portalWrapper.children.length >= 1
                ) {
                    setOverlayReady();
                }
            }
            observer.disconnect();
        });

        observer.observe(portalWrapper, { childList: true });

        return () => {
            unregisterOverlay(position, id);
        };
    }, []);

    useEffect(() => {
        updateOverlayRecord({
            id,
            position,
            priority,
        });
    }, [position, priority]);

    return createPortal(children, portalWrapper);
};
