import { createPortal } from 'react-dom';
import React, { useLayoutEffect, useContext, useRef } from 'react';
import { DEFAULT_PORTAL_WRAPPER_TAG } from './constants';
import { createElementWithId } from './dom';
import { logWarn } from './log';

interface OverlayPortalProps {
    id: string;
    reassignRoot: HTMLElement;
}

export const OverlayPortal: React.FC<OverlayPortalProps> = ({
    children,
    id,
    reassignRoot,
}) => {
    const portalWrapper = useRef<HTMLElement>(
        createElementWithId(DEFAULT_PORTAL_WRAPPER_TAG, id),
    );

    useLayoutEffect(() => {
        reassignRoot.appendChild(portalWrapper.current);
    }, []);

    return createPortal(children, portalWrapper.current);
};
