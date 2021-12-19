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
    children,
    id,
    position,
    priority,
}) => {
    const { registerOverlay, unregisterOverlay, updateOverlayRecord } =
        useContext<OverlayContextType>(OverlayContext);
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
        return () => unregisterOverlay(position, id);
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
