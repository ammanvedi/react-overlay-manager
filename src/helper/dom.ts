import { OverlayPosition } from '../types';
import { ID_MAP } from '../constants';

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

export const createElement = <T extends keyof HTMLElementTagNameMap>(
    tagName: T,
    id: string,
    styles: string,
): HTMLElementTagNameMap[T] => {
    return addStyles(createElementWithId(tagName, id), styles);
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
