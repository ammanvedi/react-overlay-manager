// @ts-ignore
import React, { useContext, useEffect, useState } from 'react';
import { ComponentMeta } from '@storybook/react';
import { OverlayContext, OverlayContextProvider } from '../overlay-context';
import { Overlay } from '../overlay';
import { mockOverlays } from './data';
import { OverlayPosition, OverlaySide } from '../types';

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
    const [overlays, setOverlays] = useState(mockOverlays);

    useEffect(() => {
        window.addEventListener('scroll', recalculateInsets);

        setTimeout(() => {
            setOverlays((o) => {
                o[2].position = OverlayPosition.TOP_RIGHT;
                o[2].priority = 0;
                return [...o];
            });
        }, 3000);

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
            {overlays.map((o) => (
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
