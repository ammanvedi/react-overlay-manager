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
import { getRandCol } from './data';

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
    height: '120vh',
};

const Story = () => {
    const [overlays, setOverlays] =
        useState<Array<OverlayProps & RandomizablePlaceholderProps>>(
            mockOverlays,
        );

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

    return (
        <div style={pageStyles}>
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

const SimpleStory = () => {
    document.body.style.backgroundColor = '#6c5ce7';
    const { setInset, clear, recalculateInsets } = useContext(OverlayContext);

    return (
        <div style={{ height: '100vh' }}>
            <Overlay
                id="a"
                position={OverlayPosition.TOP_FULL_WIDTH}
                priority={1}
            >
                <PlaceholderFullWidthNotification
                    id="a"
                    bgColor={getRandCol()}
                />
            </Overlay>
            <Overlay
                id="b"
                position={OverlayPosition.BOTTOM_FULL_WIDTH}
                priority={1}
            >
                <PlaceholderFullWidthNotification
                    id="b"
                    bgColor={getRandCol()}
                />
            </Overlay>
            <Overlay id="c" position={OverlayPosition.TOP_LEFT} priority={1}>
                <PlaceholderNotification id="c" bgColor={getRandCol()} />
            </Overlay>
            <Overlay id="d" position={OverlayPosition.TOP_CENTER} priority={1}>
                <PlaceholderNotification id="d" bgColor={getRandCol()} />
            </Overlay>
            <Overlay id="e" position={OverlayPosition.TOP_RIGHT} priority={1}>
                <PlaceholderNotification id="e" bgColor={getRandCol()} />
            </Overlay>
            <Overlay id="f" position={OverlayPosition.BOTTOM_LEFT} priority={1}>
                <PlaceholderNotification id="f" bgColor={getRandCol()} />
            </Overlay>
            <Overlay
                id="g"
                position={OverlayPosition.BOTTOM_CENTER}
                priority={1}
            >
                <PlaceholderNotification id="g" bgColor={getRandCol()} />
            </Overlay>
            <Overlay
                id="h"
                position={OverlayPosition.BOTTOM_RIGHT}
                priority={1}
            >
                <PlaceholderNotification id="h" bgColor={getRandCol()} />
            </Overlay>
        </div>
    );
};

const InsetStory = () => {
    const { setInset, recalculateInsets, clear } = useContext(OverlayContext);
    const [overlays, setOverlays] = useState<
        Array<OverlayProps & RandomizablePlaceholderProps>
    >(mockOverlays.slice(0, 6));

    useEffect(() => {
        window.addEventListener('scroll', recalculateInsets);
        document.body.style.backgroundColor = '#6c5ce7';

        return () => {
            clear();
            window.removeEventListener('scroll', recalculateInsets);
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

export const SimpleNotifications = () => {
    return (
        <OverlayContextProvider>
            <SimpleStory />
        </OverlayContextProvider>
    );
};

export const StackNotifications = () => {
    return (
        <OverlayContextProvider>
            <Overlay
                id="b"
                position={OverlayPosition.TOP_FULL_WIDTH}
                priority={1}
            >
                <PlaceholderNotification id="b" bgColor={getRandCol()}>
                    Overlay B
                </PlaceholderNotification>
            </Overlay>
            <Overlay
                id="a"
                position={OverlayPosition.TOP_FULL_WIDTH}
                priority={0}
            >
                <PlaceholderNotification id="a" bgColor={getRandCol()}>
                    Overlay A
                </PlaceholderNotification>
            </Overlay>
        </OverlayContextProvider>
    );
};

export const AvoidNavigation = () => {
    return (
        <OverlayContextProvider>
            <InsetStory />
        </OverlayContextProvider>
    );
};

export const StressTest = () => {
    return (
        <OverlayContextProvider>
            <Story />
        </OverlayContextProvider>
    );
};
