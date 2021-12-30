import { OverlayContextProvider } from '../src/overlay-context';
import { OverlayPosition } from '../src/types';

export const parameters = {
    docs: { inlineStories: false },
    actions: { argTypesRegex: '^on[A-Z].*', disabled: true },
    controls: {
        disable: true,
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
    options: {
        showPanel: false,
    },
    previewTabs: {
        'storybook/docs/panel': {
            hidden: true,
        },
    },
};

const rRules = {
    [OverlayPosition.TOP_RIGHT]: {
        '(max-width: 900px)': OverlayPosition.TOP_FULL_WIDTH,
    },
    [OverlayPosition.TOP_LEFT]: {
        '(max-width: 900px)': OverlayPosition.TOP_FULL_WIDTH,
    },
    [OverlayPosition.TOP_CENTER]: {
        '(max-width: 900px)': OverlayPosition.TOP_FULL_WIDTH,
    },
};

export const decorators = [
    (Story) => {
        /**
         * Yes this is a hack.
         *
         * https://github.com/storybookjs/storybook/issues/9209
         *
         * I want to be able to have only MDX pages without any actual stories being listed
         * because they dont actually make any sense without the MDX.
         */
        const menuItem = window.parent.parent.document.querySelector(
            '[data-item-id="hidden-stories"]',
        );
        menuItem.style.display = 'none';
        return (
            <OverlayContextProvider responsiveRules={rRules}>
                <div className="story-wrap">
                    <Story />
                </div>
            </OverlayContextProvider>
        );
    },
];
