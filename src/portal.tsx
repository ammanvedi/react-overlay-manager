import { createPortal } from 'react-dom';
import React, { useLayoutEffect, useContext, useRef } from 'react';
import { DEFAULT_PORTAL_WRAPPER_TAG } from './constants';
import { addStyles, createElementWithId } from './dom-helpers';
import * as Styles from './styles';

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
        addStyles(
            createElementWithId(DEFAULT_PORTAL_WRAPPER_TAG, id),
            Styles.WrapperOverlay,
        ),
    );

    useLayoutEffect(() => {
        reassignRoot.appendChild(portalWrapper.current);
    }, []);

    return createPortal(children, portalWrapper.current);
};
