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
    TOP = 'TOP',
    BOTTOM = 'BOTTOM',
}
