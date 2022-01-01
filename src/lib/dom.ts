import { OverlayId, OverlayPosition } from '../types';

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
    delay: number,
): Promise<void> => {
    el.style.display = 'inline-block';
    el.style.height = `auto`;
    const { width, height } = getFullHeightAndWidthOfElement(
        dimensionReferenceElement || el,
    );
    el.style.width = `${width}px`;
    el.style.display = 'block';
    el.style.opacity = '0';
    el.style.overflow = 'hidden';

    return transitionProperty(
        el,
        'height',
        '0px',
        transitionNumber(0, height),
        delay,
    )
        .then(() =>
            transitionProperty(el, 'opacity', '0', transitionOpacityIn, delay),
        )
        .then(() => {
            el.style.height = 'auto';
            el.style.width = finalWidth;
            el.style.display = 'inline-block';
            el.style.overflow = 'initial';
            return Promise.resolve();
        });
};

export const animateElementOut = (
    el: HTMLElement,
    dimensionReferenceElement: Element | null,
    finalWidth = 'auto',
    delay: number,
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

    return transitionProperty(el, 'opacity', '1', transitionOpacityOut, delay)
        .then(() =>
            transitionProperty(
                el,
                'height',
                `${height}px`,
                transitionNumber(height, 0),
                delay,
            ),
        )
        .then(() => {
            el.style.width = finalWidth;
            el.style.height = '0';
            el.style.display = 'inline-block';
            el.style.overflow = 'initial';
            return Promise.resolve();
        });
};

export const transitionNumber = (
    initial: number,
    target: number,
    suffix = 'px',
): ((n: number) => string) => {
    const diff = target - initial;

    return (pct: number) => {
        if (pct < 0) {
            return `${initial}${suffix}`;
        }

        const val = initial + pct * diff;
        const rangedVal =
            target > initial ? Math.min(target, val) : Math.max(target, val);
        return `${rangedVal}${suffix}`;
    };
};

export const transitionOpacityIn = (pct: number): string => {
    return Math.max(0, Math.min(1, pct)).toString();
};

export const transitionOpacityOut = (pct: number): string => {
    return Math.min(1, Math.max(0, 1 - pct)).toString();
};

export const DEFAULT_DURATION = 250;

/**
 * We use requestAnimationFrame as it seems to be more reliable than
 * doing the transition in css and listening for events
 */
const transitionProperty = (
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
    delay = 0,
    duration = DEFAULT_DURATION,
): Promise<void> => {
    el.style[property] = initial;
    return new Promise((res) => {
        setTimeout(() => {
            let start: DOMHighResTimeStamp | null = null;
            let lastTs: DOMHighResTimeStamp | null = null;

            const raf = (ts: DOMHighResTimeStamp) => {
                if (start === null) {
                    start = ts;
                }
                const elapsed = ts - start;

                if (ts !== lastTs) {
                    const progress = elapsed / duration;
                    const val = getTargetForPercentageStep(progress);
                    el.style[property] = val;
                }

                if (elapsed < duration) {
                    lastTs = ts;
                    window.requestAnimationFrame(raf);
                } else {
                    res();
                }
            };

            window.requestAnimationFrame(raf);
        }, delay);
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
    return el.children[0] || null;
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

export const insertAtCorrectPosition = (
    id: OverlayId,
    container: HTMLElement,
    element: HTMLElement,
    desiredOrder: Array<OverlayId>,
) => {
    const index = desiredOrder.findIndex((orderedId) => orderedId === id);
    if (index === -1) {
        return;
    }

    if (index === desiredOrder.length - 1) {
        container.appendChild(element);
        return;
    }

    const nextId = desiredOrder[index + 1];

    container.insertBefore(element, container.querySelector(`#${nextId}`));
};
