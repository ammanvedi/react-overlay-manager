import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { OverlayContextProvider } from '../overlay-context';
import { OverlayPosition } from '../types';
import { OverlayProps, Overlay } from '../overlay';

export default {
    title: 'Overlay Manager',
    component: OverlayContextProvider,
} as ComponentMeta<any>;

const mockOverlays: Array<OverlayProps> = [
    {
        id: 'a',
        position: OverlayPosition.TOP_FULL_WIDTH,
        priority: 1,
    },
    {
        id: 'b',
        position: OverlayPosition.TOP_FULL_WIDTH,
        priority: 1,
    },
    {
        id: 'c',
        position: OverlayPosition.TOP_LEFT,
        priority: 1,
    },
    {
        id: 'd',
        position: OverlayPosition.TOP_LEFT,
        priority: 1,
    },
    {
        id: 'e',
        position: OverlayPosition.TOP_CENTER,
        priority: 1,
    },
    {
        id: 'f',
        position: OverlayPosition.TOP_CENTER,
        priority: 1,
    },
    {
        id: 'g',
        position: OverlayPosition.TOP_RIGHT,
        priority: 1,
    },
    {
        id: 'h',
        position: OverlayPosition.TOP_RIGHT,
        priority: 1,
    },
    // bottom

    {
        id: 'i',
        position: OverlayPosition.BOTTOM_FULL_WIDTH,
        priority: 1,
    },
    {
        id: 'j',
        position: OverlayPosition.BOTTOM_FULL_WIDTH,
        priority: 1,
    },
    {
        id: 'k',
        position: OverlayPosition.BOTTOM_LEFT,
        priority: 1,
    },
    {
        id: 'l',
        position: OverlayPosition.BOTTOM_LEFT,
        priority: 1,
    },
    {
        id: 'm',
        position: OverlayPosition.BOTTOM_CENTER,
        priority: 1,
    },
    {
        id: 'n',
        position: OverlayPosition.BOTTOM_CENTER,
        priority: 1,
    },
    {
        id: 'o',
        position: OverlayPosition.BOTTOM_RIGHT,
        priority: 1,
    },
    {
        id: 'p',
        position: OverlayPosition.BOTTOM_RIGHT,
        priority: 1,
    },
];

const boxStyles: React.CSSProperties = {
    width: 200,
    height: 100,
    margin: 10,
    backgroundColor: 'pink',
};

export const Default = () => {
    return (
        <OverlayContextProvider>
            <div>Page Content</div>
            {mockOverlays.map((o) => (
                <Overlay key={o.id} {...o}>
                    <div style={boxStyles}>Overlay :: {o.id}</div>
                </Overlay>
            ))}
        </OverlayContextProvider>
    );
};
