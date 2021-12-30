export interface InsetRect {
    [OverlaySide.TOP]: number;
    [OverlaySide.BOTTOM]: number;
    [OverlaySide.LEFT]: number;
    [OverlaySide.RIGHT]: number;
}

export interface SafeAreaRect {
    inset: InsetRect;
}

export type OverlayId = string;
export type InsetId = string;

export type OverlayContextType = {
    safeArea: SafeAreaRect | null;
    registerOverlay: (o: OverlayCreationRecord) => HTMLElement;
    unregisterOverlay: (id: OverlayRecord['id']) => void;
    removeOverlay: (id: OverlayRecord['id']) => Promise<void>;
    updateOverlayRecord: (o: OverlayCreationRecord) => void;
    setInset: (inset: InsetRecord) => void;
    removeInset: (insetId: InsetId) => void;
    recalculateInsets: () => void;
    setOverlayReady: () => void;
    clear: () => void;
};

export interface OverlayCreationRecord {
    position: OverlayPosition;
    priority: number;
    id: OverlayId;
}

export interface Translation {
    x: number;
    y: number;
}

export interface OverlayRecord {
    id: OverlayId;
    priority: number;
    element: HTMLElement;
    position: {
        original: Readonly<OverlayPosition>;
        current: OverlayPosition | null;
        desired: OverlayPosition | null;
    };
}

export type InsetRecord = {
    id: InsetId;
    insetValue: number | HTMLElement | null;
    extraPaddingPx: number;
    side: OverlaySide;
};

export type OverlayLayoutStore = Map<OverlayPosition, Array<OverlayId>>;
export type OverlayStore = Map<OverlayId, OverlayRecord>;
export type OverlaySideInsetStore = Map<InsetId, InsetRecord>;

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

export enum OverlaySide {
    TOP = 'TOP',
    RIGHT = 'RIGHT',
    BOTTOM = 'BOTTOM',
    LEFT = 'LEFT',
}

export enum OverlayError {
    OVERLAY_EXISTS_ALREADY = 'OVERLAY_EXISTS_ALREADY',
}

enum RemovalSuggestionReason {
    TIMEOUT = 'TIMEOUT',
    OVERLAP = 'OVERLAP',
}

enum LayoutDifferentialType {
    REMOVED = 'REMOVED',
    ADDED = 'ADDED',
    MOVED = 'MOVED',
    SUGGEST_REMOVAL = 'SUGGEST_REMOVAL',
}

export interface DifferentialRemoval {
    type: LayoutDifferentialType.REMOVED;
}

export interface DifferentialAddition {
    type: LayoutDifferentialType.ADDED;
}

export interface DifferentialMoved {
    type: LayoutDifferentialType.MOVED;
}

export interface DifferentialSuggestRemoval {
    type: LayoutDifferentialType.SUGGEST_REMOVAL;
    reason: RemovalSuggestionReason;
}

export type LayoutDifferential =
    | DifferentialSuggestRemoval
    | DifferentialAddition
    | DifferentialMoved
    | DifferentialRemoval;

export type MatchMediaRecord = Record<string, OverlayPosition>;

export type ResponsiveRules = Partial<
    Record<OverlayPosition, MatchMediaRecord | null>
>;
