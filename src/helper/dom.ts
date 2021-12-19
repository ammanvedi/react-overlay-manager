import { OverlayPosition } from '../types';
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

export const animateElementIn = (el: HTMLElement): Promise<void> => {
    el.style.display = 'inline-block';
    el.style.height = `auto`;
    const { width, height } = el.getBoundingClientRect();
    el.style.width = `${width}px`;
    el.style.height = `0px`;
    el.style.display = 'block';
    el.style.opacity = '0';
    el.style.overflow = 'hidden';

    return transitionProperty(el, 'height', '0px', `${height}px`)
        .then(() => transitionProperty(el, 'opacity', '0', '1'))
        .then(() => {
            el.style.height = 'auto';
            el.style.width = `auto`;
            el.style.display = 'inline-block';
            el.style.overflow = 'initial';
        });
};

export const animateElementOut = (el: HTMLElement): Promise<void> => {
    el.style.display = 'inline-block';
    const { width, height } = el.getBoundingClientRect();

    el.style.height = `${height}px`;
    el.style.width = `${width}px`;
    el.style.display = 'block';
    el.style.opacity = '1';
    el.style.overflow = 'hidden';

    return transitionProperty(el, 'opacity', '1', '0')
        .then(() => transitionProperty(el, 'height', `${height}px`, '0px'))
        .then(() => {
            el.style.height = '0';
            el.style.display = 'inline-block';
            el.style.overflow = 'initial';
        });
};

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
    target: string,
): Promise<void> => {
    el.style[property] = initial;

    const resultPromise: Promise<void> = new Promise((res) => {
        const handler = () => {
            console.log('transition ended', property, initial, target);
            res();
            el.removeEventListener('transitionend', handler);
        };
        el.addEventListener('transitionend', handler);
        console.log('execute promise listener', property, initial, target);
    });

    console.log('execute property change', property, initial, target);

    /**
     * Now hear me out on this one, the transitions dont seem to work so well
     * when the transition property is set immediately. So here we shove this to
     * the back of the event queue and let it be called when the call stack is
     * emptied at some later time.
     */
    setTimeout(() => {
        el.style[property] = target;
    }, 0);

    return resultPromise;
};
