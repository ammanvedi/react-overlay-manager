import React, { useContext } from 'react';
import { OverlayContextType, OverlayPosition } from './types';
import { OverlayContext } from './overlay-context';
import { OverlayPortal } from './portal';

export interface ManagedOverlayProps {
    position: OverlayPosition;
    id: string;
}

export const ManagedOverlay: React.FC<ManagedOverlayProps> = ({
    children,
    id,
    position,
}) => {
    const { getRootForPosition } =
        useContext<OverlayContextType>(OverlayContext);

    const root = getRootForPosition(position);

    if (!root) {
        return null;
    }

    return (
        <OverlayPortal id={id} reassignRoot={root}>
            {children}
        </OverlayPortal>
    );
};
