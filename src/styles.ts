/**
 * This doesnt really do anything but it enables us to add a
 * template literal tag of css`...` to strings which makes
 * the editor autocomplete css
 */
export const css = (strings: TemplateStringsArray): string => {
    return strings[0];
};
export const Wrapper = css`
    position: fixed;
    inset: 0;
`;

export const WrapperOverlay = css`
    transition: 0.2s ease-out transform;
    transform-origin: 0% 0%;
    position: absolute;
    top: 0;
    left: 0;
`;
