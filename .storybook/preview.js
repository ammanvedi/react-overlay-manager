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
