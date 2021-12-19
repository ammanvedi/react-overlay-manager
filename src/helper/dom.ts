import React from 'react';
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

export const animateElementIn = (el: HTMLElement): Promise<void> => {
    el.style.display = 'inline-block';
    const { width, height } = el.getBoundingClientRect();

    el.style.height = `0px`;
    el.style.width = `${width}px`;
    el.style.display = 'block';
    el.style.opacity = '1';
    el.style.overflow = 'hidden';

    return transitionProperty(el, 'opacity', '0', '1')
        .then(() => transitionProperty(el, 'height', '0px', `${height}px`))
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
            el.style.height = 'auto';
            el.style.width = `auto`;
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
    console.log('request transition', property, initial, target);
    el.style[property] = initial;

    const resultPromise: Promise<void> = new Promise((res) => {
        el.addEventListener('transitionend', () => {
            console.log('resolve promise', property, initial, target);
            res();
        });
    });

    el.style[property] = target;

    return resultPromise;
};
