export interface SafeAreaRect {
    inset: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}

export type OverlayContextType = {
    safeArea: SafeAreaRect | null;
    getRootForPosition: (position: OverlayPosition) => null | HTMLElement;
};

export enum OverlayPosition {
    TOP_FULL_WIDTH = 'TOP_FULL_WIDTH',
    BOTTOM_FULL_WIDTH = 'BOTTOM_FULL_WIDTH',
    TOP_LEFT = 'TOP_LEFT',
    TOP_CENTER = 'TOP_CENTER',
    TOP_RIGHT = 'TOP_RIGHT',
    BOTTOM_LEFT = 'BOTTOM_LEFT',
    BOTTOM_CENTER = 'BOTTOM_CENTER',
    BOTTOM_RIGHT = 'BOTTOM_RIGHT',
}
