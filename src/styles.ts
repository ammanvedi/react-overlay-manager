import { createContainers } from './dom-helpers';
import { css } from './template';

console.log(css, createContainers);
export const Wrapper = css`
    position: fixed;
    inset: 0;
`;

export const WrapperTop = css`
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
`;

export const WrapperTopFullWidth = css`
    width: 100%;
`;

export const WrapperBottom = css`
    position: absolute;
    width: 100%;
    bottom: 0;
    left: 0;
    right: 0;
`;

export const WrapperBottomFullWidth = css`
    width: 100%;
`;

export const WrapperOverlay = css``;

export const SplitContainerWrapper = css`
    display: flex;
`;

export const SplitContainerChild = css`
    flex: 1 1 auto;
`;
