export interface SafeAreaRect {
    inset: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}

export type OverlayId = string;

export type OverlayContextType = {
    safeArea: SafeAreaRect | null;
    registerOverlay: (o: OverlayCreationRecord) => HTMLElement;
    unregisterOverlay: (
        position: OverlayRecord['position'],
        id: OverlayRecord['id'],
    ) => void;
    updateOverlayRect: (id: OverlayId, rect: DOMRect) => void;
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

export interface OverlayRecord extends OverlayCreationRecord {
    element: HTMLElement;
    translation: Translation | null;
    rect: DOMRect | null;
}

export type OverlayLayoutStore = Map<OverlayPosition, Array<OverlayId>>;
export type OverlayStore = Map<OverlayId, OverlayRecord>;

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

export type ResponsiveRules = Record<OverlayPosition, MatchMediaRecord | null>;
