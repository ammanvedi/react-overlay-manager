// @ts-ignore
import React, { useContext, useEffect } from 'react';
import { ComponentMeta } from '@storybook/react';
import { OverlayContext, OverlayContextProvider } from '../overlay-context';
import { Overlay } from '../overlay';
import { mockOverlays } from './data';
import { OverlaySide } from '../types';

export default {
    title: 'Overlay Manager',
    component: OverlayContextProvider,
} as ComponentMeta<any>;

const boxStyles: React.CSSProperties = {
    width: 200,
    height: 20,
    margin: 10,
    backgroundColor: 'pink',
};

const navStyles: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'blue',
    height: 70,
};

const pageStyles: React.CSSProperties = {
    height: '200vh',
};

const Story = () => {
    const { setInset, recalculateInsets } = useContext(OverlayContext);

    useEffect(() => {
        window.addEventListener('scroll', recalculateInsets);

        return () => {
            window.removeEventListener('scroll', recalculateInsets);
        };
    }, []);

    return (
        <div style={pageStyles}>
            <nav
                ref={(ref) => {
                    setInset({
                        id: 'navigation',
                        insetValue: ref,
                        side: OverlaySide.TOP,
                        extraPaddingPx: 16,
                    });
                }}
                style={navStyles}
            />
            {mockOverlays.map((o) => (
                <Overlay key={o.id} {...o}>
                    <div style={boxStyles}>Overlay :: {o.id}</div>
                </Overlay>
            ))}
        </div>
    );
};

export const Default = () => {
    return (
        <OverlayContextProvider>
            <Story />
        </OverlayContextProvider>
    );
};
