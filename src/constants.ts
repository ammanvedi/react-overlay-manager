import { css } from './lib/styles';
import {
    ConstraintViolationCallback,
    OverlayPosition,
    ResponsiveRules,
    ViolationReactionType,
} from './types';

export const DEFAULT_PORTAL_WRAPPER_ID = 'rom-portal';
export const ID_MAP: Record<OverlayPosition | 'container' | 'styles', string> =
    {
        [OverlayPosition.TOP_CENTER]: `${DEFAULT_PORTAL_WRAPPER_ID}_top_center`,
        [OverlayPosition.TOP_FULL_WIDTH]: `${DEFAULT_PORTAL_WRAPPER_ID}_top_full_width`,
        [OverlayPosition.TOP_LEFT]: `${DEFAULT_PORTAL_WRAPPER_ID}_top_left`,
        [OverlayPosition.TOP_RIGHT]: `${DEFAULT_PORTAL_WRAPPER_ID}_top_right`,
        [OverlayPosition.BOTTOM_CENTER]: `${DEFAULT_PORTAL_WRAPPER_ID}_bottom_center`,
        [OverlayPosition.BOTTOM_FULL_WIDTH]: `${DEFAULT_PORTAL_WRAPPER_ID}_bottom_full_width`,
        [OverlayPosition.BOTTOM_LEFT]: `${DEFAULT_PORTAL_WRAPPER_ID}_bottom_left`,
        [OverlayPosition.BOTTOM_RIGHT]: `${DEFAULT_PORTAL_WRAPPER_ID}_bottom_right`,
        container: `${DEFAULT_PORTAL_WRAPPER_ID}_container`,
        styles: `${DEFAULT_PORTAL_WRAPPER_ID}_styles`,
    };

export const DEFAULT_PORTAL_WRAPPER_TAG: keyof HTMLElementTagNameMap = 'div';

export const BASE_CSS = css`
    .overlay {
        pointer-events: none;
        position: fixed;
        inset: 0;
        transition: 0.2s ease-out inset;
    }

    .wrapper {
        position: absolute;
        left: 0;
        right: 0;
    }

    .wrapper--top {
        top: 0;
    }

    .wrapper--bottom {
        bottom: 0;
    }

    .full {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .split {
        width: 100%;
        display: flex;
        justify-content: space-between;
    }

    .split--bottom {
        transform: translateY(-100%);
    }

    .left {
        align-self: flex-start;
    }

    .right {
        justify-self: flex-end;
    }

    .right > .overlay-wrapper {
        transform: translateX(-100%);
    }

    .center {
        justify-self: center;
    }

    .center > .overlay-wrapper {
        transform: translateX(-50%);
    }

    .left,
    .right,
    .center {
        background-color: green;
        width: 0px;
    }

    .wrapper--bottom .left,
    .wrapper--bottom .right,
    .wrapper--bottom .center {
        justify-content: flex-end;
        justify-self: flex-end;
        align-self: flex-end;
    }

    .overlay-wrapper {
        pointer-events: all;
        width: 100%;
        backface-visibility: hidden;
    }

    .overlay-wrapper > * {
        box-sizing: border-box;
    }
`;

export const BASE_LAYOUT = `
    <div class="overlay" id="${ID_MAP.container}">
        <style id="${ID_MAP.styles}">${BASE_CSS}</style>
        <div class="wrapper wrapper--top">
          <div class="full" id="${ID_MAP.TOP_FULL_WIDTH}">
          </div>
          <div class="split">
            <div class="left" id="${ID_MAP.TOP_LEFT}">
            </div>
            <div class="center" id="${ID_MAP.TOP_CENTER}">
            </div>
            <div class="right" id="${ID_MAP.TOP_RIGHT}">
            </div>
          </div>
        </div>

        <div class="wrapper wrapper--bottom">
          <div class="split">
            <div class="left" id="${ID_MAP.BOTTOM_LEFT}">
            </div>
            <div class="center" id="${ID_MAP.BOTTOM_CENTER}">
            </div>
            <div class="right" id="${ID_MAP.BOTTOM_RIGHT}">
            </div>
          </div>
          <div class="full" id="${ID_MAP.BOTTOM_FULL_WIDTH}">
          </div>
        </div>
      </div>
`;

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};

export const DEFAULT_CONSTRAINT_VIOLATION_CALLBACK: ConstraintViolationCallback =
    () => {
        return {
            type: ViolationReactionType.REMOVE_OLDEST_AUTO,
        };
    };

export const DEFAULT_RESPONSIVE_RULES: ResponsiveRules = {
    [OverlayPosition.TOP_RIGHT]: {
        '(max-width: 900px)': {
            position: OverlayPosition.TOP_CENTER,
            constraints: null,
        },
    },
    [OverlayPosition.TOP_LEFT]: {
        '(max-width: 900px)': {
            position: OverlayPosition.TOP_CENTER,
            constraints: null,
        },
    },
    [OverlayPosition.BOTTOM_RIGHT]: {
        '(max-width: 900px)': {
            position: OverlayPosition.BOTTOM_CENTER,
            constraints: null,
        },
    },
    [OverlayPosition.BOTTOM_LEFT]: {
        '(max-width: 900px)': {
            position: OverlayPosition.BOTTOM_CENTER,
            constraints: null,
        },
    },
};
