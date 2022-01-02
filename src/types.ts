export interface InsetRect {
    [OverlaySide.TOP]: number;
    [OverlaySide.BOTTOM]: number;
    [OverlaySide.LEFT]: number;
    [OverlaySide.RIGHT]: number;
}

export interface InsetRectCalculation {
    [OverlaySide.TOP]: {
        numeric: number;
        ref: number;
    };
    [OverlaySide.BOTTOM]: {
        numeric: number;
        ref: number;
    };
    [OverlaySide.LEFT]: {
        numeric: number;
        ref: number;
    };
    [OverlaySide.RIGHT]: {
        numeric: number;
        ref: number;
    };
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
    setOverlayReady: (id: OverlayId) => void;
    clear: () => void;
};

export type ConstraintViolationCallback = (
    violation: ConstraintViolationRecord,
) => ConstraintViolationReaction;

export interface OverlayCreationRecord {
    position: OverlayPosition;
    priority: number;
    id: OverlayId;
    onRemovedAfterConstraintViolation?: (id: OverlayId) => void;
    hideAfterMs?: number;
}

export interface OverlayRecord {
    id: OverlayId;
    priority: number;
    element: HTMLElement;
    hideAfterMs?: number;
    createdAt: number;
    onRemovedAfterConstraintViolation?: (id: OverlayId) => void;
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

export enum PositionConstraints {
    MAX_ITEMS = 'MAX_ITEMS',
}

export interface PositionConstraintMaxItems {
    type: PositionConstraints.MAX_ITEMS;
    max: number;
}

export type PositionConstraint = PositionConstraintMaxItems;

export type ResponsiveConstraints = {
    position: OverlayPosition | null;
    constraints: Array<PositionConstraint> | null;
};

export type MatchMediaRecord = Record<string, ResponsiveConstraints>;

export type ResponsiveRules = Partial<
    Record<OverlayPosition, MatchMediaRecord | null>
>;

export enum ViolationReactionType {
    REMOVE_OLDEST_AUTO = 'REMOVE_OLDEST_AUTO',
    REMOVE_IDS = 'REMOVE_IDS',
    NO_ACTION = 'NO_ACTION',
}

export interface ViolationReactionRemoveOldestAuto {
    type: ViolationReactionType.REMOVE_OLDEST_AUTO;
}

export interface ViolationReactionNoAction {
    type: ViolationReactionType.NO_ACTION;
}

export interface ViolationReactionRemoveIds {
    type: ViolationReactionType.REMOVE_IDS;
    ids: Array<OverlayId>;
}

export type ConstraintViolationReaction =
    | ViolationReactionRemoveOldestAuto
    | ViolationReactionRemoveIds
    | ViolationReactionNoAction;

export interface ConstraintViolationRecord {
    violationPosition: OverlayPosition;
    overlays: Readonly<Array<OverlayRecord>>;
}
