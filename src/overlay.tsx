import { createPortal } from 'react-dom';
import React, { useEffect, useContext, ReactNode, useMemo } from 'react';
import { OverlayContextType, OverlayId, OverlayPosition } from './types';
import { OverlayContext } from './overlay-context';

export interface OverlayProps {
    /**
     * A unique ID for this overlay
     */
    id: OverlayId;
    /**
     * Where to render the component, for more information see the Positioning documentation
     */
    position: OverlayPosition;
    /**
     * The priority index of the component, for more information see the Priorities documentation
     */
    priority: number;
    /**
     * There should be a single child, the component that you need to overlay
     */
    children: ReactNode;
    /**
     * A number of milliseconds after which the overlay will be removed
     */
    hideAfterMs?: number;
    /**
     * When this overlay is removed due to a constraint violation we will be notified
     * via this callback.
     */
    onRemovedAfterConstraintViolation?: (id: OverlayId) => void;
}

export const Overlay: React.FC<OverlayProps> = ({
    children,
    id,
    position,
    priority,
    hideAfterMs,
    onRemovedAfterConstraintViolation,
}) => {
    const {
        registerOverlay,
        unregisterOverlay,
        updateOverlayRecord,
        setOverlayReady,
    } = useContext<OverlayContextType>(OverlayContext);
    const portalWrapper = useMemo<HTMLElement>(
        () =>
            registerOverlay({
                id,
                position,
                priority,
                hideAfterMs,
                onRemovedAfterConstraintViolation,
            }),
        [],
    );

    /**
     * TODO ADD RESIZE OBSERVER
     */

    useEffect(() => {
        if (portalWrapper.children.length) {
            setOverlayReady(id);
        } else {
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
                        setOverlayReady(id);
                    }
                }
                observer.disconnect();
            });

            observer.observe(portalWrapper, { childList: true });
        }

        return () => {
            unregisterOverlay(id);
        };
    }, []);

    useEffect(() => {
        updateOverlayRecord({
            id,
            position,
            priority,
            onRemovedAfterConstraintViolation,
        });
    }, [position, priority, onRemovedAfterConstraintViolation]);

    return createPortal(children, portalWrapper);
};
