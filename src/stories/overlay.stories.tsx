// @ts-ignore
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ComponentMeta } from '@storybook/react';
import { OverlayContext, OverlayContextProvider } from '../overlay-context';
import { Overlay } from '../overlay';
import {
    applyRandomActionToOverlays,
    getRandomEvent,
    mockOverlays,
} from './data';
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

        return () => {
            window.removeEventListener('scroll', recalculateInsets);
        };
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setOverlays((o) => {
                const action = getRandomEvent(overlays.length);
                return applyRandomActionToOverlays(action, o);
            });
        }, 500);

        return () => {
            clearInterval(intervalId);
        };
    }, [overlays]);

    /**
     * TODO make a point that this ref callback needs to be
     * memoized, otherwise it will get called more than it
     * needs to be. Alternatively we should make a nicer
     * way to handle these refs
     */
    const refCb = useCallback((ref) => {
        setInset({
            id: 'navigation',
            insetValue: ref,
            side: OverlaySide.TOP,
            extraPaddingPx: 16,
        });
    }, []);

    return (
        <div style={pageStyles}>
            <nav ref={refCb} style={navStyles} />
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
