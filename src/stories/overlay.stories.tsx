// @ts-ignore
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ComponentMeta } from '@storybook/react';
import { OverlayContext, OverlayContextProvider } from '../overlay-context';
import { Overlay, OverlayProps } from '../overlay';
import {
    applyRandomActionToOverlays,
    getRandomEvent,
    mockOverlays,
} from './data';
import { OverlayPosition, OverlaySide } from '../types';
import {
    PlaceholderFullWidthNotification,
    PlaceholderNotification,
    RandomizablePlaceholderProps,
} from './placeholder-notification';

export default {
    title: 'Overlay Manager',
    component: OverlayContextProvider,
} as ComponentMeta<any>;

const navStyles: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'blue',
    height: 70,
    borderRadius: 10,
    border: '3px solid black',
};

const pageStyles: React.CSSProperties = {
    height: '200vh',
};

const Story = () => {
    const { setInset, recalculateInsets } = useContext(OverlayContext);
    const [overlays, setOverlays] =
        useState<Array<OverlayProps & RandomizablePlaceholderProps>>(
            mockOverlays,
        );

    useEffect(() => {
        window.addEventListener('scroll', recalculateInsets);
        document.body.style.backgroundColor = '#6c5ce7';

        return () => {
            window.removeEventListener('scroll', recalculateInsets);
        };
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setOverlays((o) => {
                const action = getRandomEvent(overlays.length, o);
                return applyRandomActionToOverlays(action, o);
            });
        }, 250);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

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
            {overlays.map((o) => {
                switch (o.position) {
                    case OverlayPosition.TOP_FULL_WIDTH:
                    case OverlayPosition.BOTTOM_FULL_WIDTH:
                        return (
                            <Overlay key={o.id} {...o}>
                                <PlaceholderFullWidthNotification
                                    id={o.id}
                                    bgColor={o.bgColor}
                                >
                                    <div>Overlay :: {o.id}</div>
                                </PlaceholderFullWidthNotification>
                            </Overlay>
                        );
                    default:
                        return (
                            <Overlay key={o.id} {...o}>
                                <PlaceholderNotification
                                    id={o.id}
                                    bgColor={o.bgColor}
                                >
                                    <div>Overlay :: {o.id}</div>
                                </PlaceholderNotification>
                            </Overlay>
                        );
                }
            })}
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
