import * as Styles from './styles';
import { OverlayPosition } from './types';
import { getPortalWrapperIdForPosition } from './constants';

export const createElementWithId = <T extends keyof HTMLElementTagNameMap>(
    tagName: T,
    id: string,
): HTMLElementTagNameMap[T] => {
    const el = document.createElement(tagName);
    el.setAttribute('id', id);
    return el;
};

export const addStyles = <T extends HTMLElement>(el: T, styles: string): T => {
    el.setAttribute('style', styles);
    return el;
};

export const createElement = <T extends keyof HTMLElementTagNameMap>(
    tagName: T,
    id: string,
    styles: string,
): HTMLElementTagNameMap[T] => {
    return addStyles(createElementWithId(tagName, id), styles);
};

export const createSplitContainers = (
    rootId: string,
    positions: Array<OverlayPosition>,
) => {
    const children = positions.map((p) => {
        return createElement(
            'div',
            getPortalWrapperIdForPosition(p, rootId),
            Styles.SplitContainerChild,
        );
    });

    const container = createElement(
        'div',
        rootId,
        Styles.SplitContainerWrapper,
    );

    container.append(...children);

    return {
        children,
        container,
    };
};

export const createContainers = (
    rootId: string,
): Record<OverlayPosition | 'container', HTMLDivElement> => {
    const container = createElement('div', rootId, Styles.Wrapper);

    const containerTop = createElement(
        'div',
        `${rootId}_top`,
        Styles.WrapperTop,
    );

    const containerTopFullWidth = createElement(
        'div',
        getPortalWrapperIdForPosition(OverlayPosition.TOP_FULL_WIDTH, rootId),
        Styles.WrapperTopFullWidth,
    );

    const containerBottom = createElement(
        'div',
        `${rootId}_bottom`,
        Styles.WrapperBottom,
    );

    const containerBottomFullWidth = createElement(
        'div',
        getPortalWrapperIdForPosition(
            OverlayPosition.BOTTOM_FULL_WIDTH,
            rootId,
        ),
        Styles.WrapperBottomFullWidth,
    );

    const {
        container: splitContainerBottom,
        children: [bottomLeft, bottomCenter, bottomRight],
    } = createSplitContainers(`${rootId}_bottom_split`, [
        OverlayPosition.BOTTOM_LEFT,
        OverlayPosition.BOTTOM_CENTER,
        OverlayPosition.BOTTOM_RIGHT,
    ]);

    const {
        container: splitContainerTop,
        children: [topLeft, topCenter, topRight],
    } = createSplitContainers(`${rootId}_top_split`, [
        OverlayPosition.TOP_LEFT,
        OverlayPosition.TOP_CENTER,
        OverlayPosition.TOP_RIGHT,
    ]);

    container.append(containerTop, containerBottom);

    containerTop.append(containerTopFullWidth, splitContainerTop);
    containerBottom.append(splitContainerBottom, containerBottomFullWidth);

    return {
        container,
        [OverlayPosition.TOP_FULL_WIDTH]: containerTopFullWidth,
        [OverlayPosition.TOP_LEFT]: topLeft,
        [OverlayPosition.TOP_CENTER]: topCenter,
        [OverlayPosition.TOP_RIGHT]: topRight,
        [OverlayPosition.BOTTOM_FULL_WIDTH]: containerBottomFullWidth,
        [OverlayPosition.BOTTOM_LEFT]: bottomLeft,
        [OverlayPosition.BOTTOM_CENTER]: bottomCenter,
        [OverlayPosition.BOTTOM_RIGHT]: bottomRight,
    };
};
