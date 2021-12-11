import { OverlayPosition } from './types';

export const DEFAULT_PORTAL_WRAPPER_ID = 'rom-portal';

export const getPortalWrapperIdForPosition = (
    position: OverlayPosition,
    id: string,
): string => {
    return `${id}_${position}`;
};

export const DEFAULT_PORTAL_WRAPPER_TAG: keyof HTMLElementTagNameMap = 'div';
