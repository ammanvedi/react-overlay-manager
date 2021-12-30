import { OverlayPosition, OverlayRecord } from '../types';
import { ID_MAP } from '../constants';

export const createElementWithId = <T extends keyof HTMLElementTagNameMap>(
    tagName: T,
    id: string,
    className?: string,
): HTMLElementTagNameMap[T] => {
    const el = document.createElement(tagName);
    el.setAttribute('id', id);
    el.setAttribute('class', className || '');
    return el;
};

export const addStyles = <T extends HTMLElement>(el: T, styles: string): T => {
    el.setAttribute('style', styles);
    return el;
};

export const createElementWithInnerHTML = <
    T extends keyof HTMLElementTagNameMap,
>(
    tagName: T,
    id: string,
    innerHTML: string,
): HTMLElementTagNameMap[T] => {
    const el = createElementWithId(tagName, id);
    el.innerHTML = innerHTML;

    return el;
};

export const getContainerForPosition = (
    position: OverlayPosition,
): HTMLElement | null => {
    return document.getElementById(ID_MAP[position]);
};

export const addToBodyAndRemoveOld = <T extends HTMLElement>(
    el: T,
    id: string,
): T => {
    const oldRoot = document.getElementById(id);

    if (oldRoot) {
        oldRoot.remove();
    }

    document.body.appendChild(el);
    return el;
};

export const animateElementIn = (
    el: HTMLElement,
    dimensionReferenceElement: Element | null,
    finalWidth = 'auto',
): Promise<void> => {
    el.style.display = 'inline-block';
    el.style.height = `auto`;
    const { width, height } = getFullHeightAndWidthOfElement(
        dimensionReferenceElement || el,
    );
    el.style.width = `${width}px`;
    el.style.height = `0px`;
    el.style.display = 'block';
    el.style.opacity = '0';
    el.style.overflow = 'hidden';

    return transitionProperty(el, 'height', '0px', transitionNumber(0, height))
        .then(() =>
            transitionProperty(el, 'opacity', '0px', transitionOpacityIn),
        )
        .then(() => {
            el.style.height = 'auto';
            el.style.width = finalWidth;
            el.style.display = 'inline-block';
            el.style.overflow = 'initial';
        });
};

export const animateElementOut = (
    el: HTMLElement,
    dimensionReferenceElement: Element | null,
    finalWidth = 'auto',
): Promise<void> => {
    el.style.display = 'inline-block';
    const { width, height } = getFullHeightAndWidthOfElement(
        dimensionReferenceElement || el,
    );

    el.style.height = `${height}px`;
    el.style.width = `${width}px`;
    el.style.display = 'block';
    el.style.opacity = '1';
    el.style.overflow = 'hidden';

    return transitionProperty(el, 'opacity', '0', transitionOpacityOut)
        .then(() =>
            transitionProperty(
                el,
                'height',
                `${height}px`,
                transitionNumber(height, 0),
            ),
        )
        .then(() => {
            el.style.width = finalWidth;
            el.style.height = '0';
            el.style.display = 'inline-block';
            el.style.overflow = 'initial';
        });
};

export const transitionNumber = (
    initial: number,
    target: number,
    suffix = 'px',
) => {
    const diff = target - initial;

    return (pct: number) => {
        return `${initial + pct * diff}${suffix}`;
    };
};

export const transitionOpacityIn = (pct: number): string => {
    return Math.min(1, pct).toString();
};

export const transitionOpacityOut = (pct: number): string => {
    return Math.max(0, 1 - pct).toString();
};

/**
 * We use requestAnimationFrame as it seems to be more reliable than
 * doing the transition in css and listening for events
 */
export const transitionProperty = (
    el: HTMLElement,
    property: Exclude<
        keyof CSSStyleDeclaration,
        | 'length'
        | 'parentRule'
        | 'getPropertyPriority'
        | 'getPropertyValue'
        | 'item'
        | 'removeProperty'
        | 'setProperty'
    >,
    initial: string,
    getTargetForPercentageStep: (pct: number) => string,
    duration = 300,
): Promise<void> => {
    el.style[property] = initial;
    return new Promise((res) => {
        let start: DOMHighResTimeStamp | null = null;
        let lastTs: DOMHighResTimeStamp | null = null;
        const max = getTargetForPercentageStep(1);

        const raf = (ts: DOMHighResTimeStamp) => {
            if (start === null) {
                start = ts;
            }
            const elapsed = ts - start;

            if (ts !== lastTs) {
                const progress = elapsed / duration;
                el.style[property] = getTargetForPercentageStep(progress);
            }

            if (elapsed < duration) {
                lastTs = ts;
                window.requestAnimationFrame(raf);
            } else {
                el.style[property] = getTargetForPercentageStep(1);
                res();
            }
        };

        window.requestAnimationFrame(raf);
    });
};

export const getFinalWidth = (p: OverlayPosition | null): string => {
    switch (p) {
        case OverlayPosition.BOTTOM_FULL_WIDTH:
        case OverlayPosition.TOP_FULL_WIDTH:
            return '100%';
        default:
            return 'auto';
    }
};

export const getWidthReference = (el: HTMLElement): Element | null => {
    return el.children[0];
};

export const getFullHeightAndWidthOfElement = (
    el: Element,
): { width: number; height: number } => {
    const { width: baseWidth, height: baseHeight } = el.getBoundingClientRect();

    const { marginLeft, marginRight, marginTop, marginBottom } =
        window.getComputedStyle(el);

    return {
        width: baseWidth + parseInt(marginLeft) + parseInt(marginRight),
        height: baseHeight + parseInt(marginTop) + parseInt(marginBottom),
    };
};
