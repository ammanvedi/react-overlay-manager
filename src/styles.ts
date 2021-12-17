/**
 * This doesnt really do anything but it enables us to add a
 * template literal tag of css`...` to strings which makes
 * the editor autocomplete css
 */
export const css = (strings: TemplateStringsArray): string => {
    return strings[0];
};
