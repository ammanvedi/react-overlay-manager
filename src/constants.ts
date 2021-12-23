import { css } from './styles';
import { OverlayPosition, ResponsiveRules } from './types';

export const DATA_MOUNTED = 'data-mounted';
export const DEFAULT_PORTAL_WRAPPER_ID = 'rom-portal';
export const ID_MAP: Record<OverlayPosition | 'container', string> = {
    [OverlayPosition.TOP_CENTER]: `${DEFAULT_PORTAL_WRAPPER_ID}_top_center`,
    [OverlayPosition.TOP_FULL_WIDTH]: `${DEFAULT_PORTAL_WRAPPER_ID}_top_full_width`,
    [OverlayPosition.TOP_LEFT]: `${DEFAULT_PORTAL_WRAPPER_ID}_top_left`,
    [OverlayPosition.TOP_RIGHT]: `${DEFAULT_PORTAL_WRAPPER_ID}_top_right`,
    [OverlayPosition.BOTTOM_CENTER]: `${DEFAULT_PORTAL_WRAPPER_ID}_bottom_center`,
    [OverlayPosition.BOTTOM_FULL_WIDTH]: `${DEFAULT_PORTAL_WRAPPER_ID}_bottom_full_width`,
    [OverlayPosition.BOTTOM_LEFT]: `${DEFAULT_PORTAL_WRAPPER_ID}_bottom_left`,
    [OverlayPosition.BOTTOM_RIGHT]: `${DEFAULT_PORTAL_WRAPPER_ID}_bottom_right`,
    container: `${DEFAULT_PORTAL_WRAPPER_ID}_container`,
};

export const DEFAULT_PORTAL_WRAPPER_TAG: keyof HTMLElementTagNameMap = 'div';

export const BASE_CSS = css`
    .overlay {
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

    .box {
        width: 100px;
        height: 100px;
        background-color: red;
        border: 3px solid blue;
        opacity: 0.8;
    }

    .box--full {
        width: 100%;
    }

    .overlay-wrapper {
        opacity: 0;
        transition: 0.3s ease-out height, 0.3s ease-out opacity;
    }
`;

export const BASE_LAYOUT = `
    <div class="overlay" id="${ID_MAP.container}">
        <style>${BASE_CSS}</style>
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

export const DEFAULT_RESPONSIVE_RULES: ResponsiveRules = {
    [OverlayPosition.TOP_RIGHT]: {
        '(max-width: 900px)': OverlayPosition.TOP_CENTER,
    },
    [OverlayPosition.TOP_LEFT]: {
        '(max-width: 900px)': OverlayPosition.TOP_CENTER,
    },
    [OverlayPosition.BOTTOM_RIGHT]: {
        '(max-width: 900px)': OverlayPosition.BOTTOM_CENTER,
    },
    [OverlayPosition.BOTTOM_LEFT]: {
        '(max-width: 900px)': OverlayPosition.BOTTOM_CENTER,
    },
    [OverlayPosition.TOP_FULL_WIDTH]: null,
    [OverlayPosition.BOTTOM_FULL_WIDTH]: null,
    [OverlayPosition.TOP_CENTER]: null,
    [OverlayPosition.BOTTOM_CENTER]: null,
};
