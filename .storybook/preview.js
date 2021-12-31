import { OverlayContextProvider } from '../src/overlay-context';
import { OverlayPosition, PositionConstraints } from '../src/types';

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

const getRRules = (id) => {
    switch (id) {
        case 'hidden-stories--constraint-max-items':
            return {
                [OverlayPosition.TOP_FULL_WIDTH]: {
                    '(min-width: 0px)': {
                        position: OverlayPosition.TOP_FULL_WIDTH,
                        constraints: [
                            {
                                type: PositionConstraints.MAX_ITEMS,
                                max: 3,
                            },
                        ],
                    },
                },
            };
        default:
            return {
                [OverlayPosition.TOP_RIGHT]: {
                    '(max-width: 900px)': {
                        position: OverlayPosition.TOP_FULL_WIDTH,
                        constraints: null,
                    },
                },
                [OverlayPosition.TOP_LEFT]: {
                    '(max-width: 900px)': {
                        position: OverlayPosition.TOP_FULL_WIDTH,
                        constraints: null,
                    },
                },
                [OverlayPosition.TOP_CENTER]: {
                    '(max-width: 900px)': {
                        position: OverlayPosition.TOP_FULL_WIDTH,
                        constraints: null,
                    },
                },
            };
    }
};

export const decorators = [
    (Story, p) => {
        /**
         * Yes this is a hack.
         *
         * https://github.com/storybookjs/storybook/issues/9209
         *
         * I want to be able to have only MDX pages without any actual stories being listed
         * because they dont actually make any sense without the MDX.
         */
        const hideItems = ['[data-item-id="hidden-stories"]', '.search-field'];
        hideItems.map((i) => {
            const itm = window.parent.parent.document.querySelector(i);
            if (itm) {
                itm.style.display = 'none';
            }
        });

        return (
            <OverlayContextProvider responsiveRules={getRRules(p.id)}>
                <div className="story-wrap">
                    <Story />
                </div>
            </OverlayContextProvider>
        );
    },
];
