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
