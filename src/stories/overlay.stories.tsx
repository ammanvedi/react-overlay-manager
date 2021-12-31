import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { ComponentMeta } from '@storybook/react';
import { OverlayContext, OverlayContextProvider } from '../overlay-context';
import { Overlay, OverlayProps } from '../overlay';
import {
    applyRandomActionToOverlays,
    getRandCol,
    getRandomEvent,
    mockOverlays,
} from './data';
import {
    OverlayCreationRecord,
    OverlayId,
    OverlayPosition,
    OverlaySide,
} from '../types';
import {
    PlaceholderFullWidthNotification,
    PlaceholderNotification,
    RandomizablePlaceholderProps,
} from './placeholder-notification';
import { buttonStyles } from './styles';

export default {
    title: 'Hidden Stories',
    component: OverlayContextProvider,
} as ComponentMeta<any>;

const navStyles: React.CSSProperties = {
    backgroundColor: 'blue',
    height: 70,
    borderRadius: 10,
    border: '3px solid black',
};

const pageStyles: React.CSSProperties = {
    height: '130vh',
};

export const CenterTop = () => {
    return (
        <Overlay id="a" position={OverlayPosition.TOP_CENTER} priority={1}>
            <PlaceholderNotification id="a" bgColor={getRandCol()}>
                Overlay A
            </PlaceholderNotification>
        </Overlay>
    );
};

export const AllPositions = () => {
    return (
        <>
            <Overlay
                id="a"
                position={OverlayPosition.TOP_FULL_WIDTH}
                priority={1}
            >
                <PlaceholderFullWidthNotification id="a" bgColor={getRandCol()}>
                    Overlay A
                </PlaceholderFullWidthNotification>
            </Overlay>
            <Overlay
                id="b"
                position={OverlayPosition.BOTTOM_FULL_WIDTH}
                priority={1}
            >
                <PlaceholderFullWidthNotification id="b" bgColor={getRandCol()}>
                    Overlay B
                </PlaceholderFullWidthNotification>
            </Overlay>
            <Overlay id="c" position={OverlayPosition.TOP_LEFT} priority={1}>
                <PlaceholderNotification id="c" bgColor={getRandCol()}>
                    Overlay C
                </PlaceholderNotification>
            </Overlay>
            <Overlay id="d" position={OverlayPosition.TOP_CENTER} priority={1}>
                <PlaceholderNotification id="d" bgColor={getRandCol()}>
                    Overlay D
                </PlaceholderNotification>
            </Overlay>
            <Overlay id="e" position={OverlayPosition.TOP_RIGHT} priority={1}>
                <PlaceholderNotification id="e" bgColor={getRandCol()}>
                    Overlay E
                </PlaceholderNotification>
            </Overlay>
            <Overlay id="f" position={OverlayPosition.BOTTOM_LEFT} priority={1}>
                <PlaceholderNotification id="f" bgColor={getRandCol()}>
                    Overlay F
                </PlaceholderNotification>
            </Overlay>
            <Overlay
                id="g"
                position={OverlayPosition.BOTTOM_CENTER}
                priority={1}
            >
                <PlaceholderNotification id="g" bgColor={getRandCol()}>
                    Overlay G
                </PlaceholderNotification>
            </Overlay>
            <Overlay
                id="h"
                position={OverlayPosition.BOTTOM_RIGHT}
                priority={1}
            >
                <PlaceholderNotification id="h" bgColor={getRandCol()}>
                    Overlay H
                </PlaceholderNotification>
            </Overlay>
        </>
    );
};

export const ManualRemoval = () => {
    const { removeOverlay } = useContext(OverlayContext);
    const [show, setShow] = useState(true);
    const toggleInsert = () => {
        removeOverlay('a').then(() => {
            setShow((s) => !s);
        });
    };

    return (
        <>
            {show && (
                <Overlay
                    id="a"
                    position={OverlayPosition.TOP_FULL_WIDTH}
                    priority={4}
                >
                    <PlaceholderFullWidthNotification
                        id="a"
                        bgColor={getRandCol()}
                    >
                        Hello World!
                    </PlaceholderFullWidthNotification>
                </Overlay>
            )}
            <Overlay
                id="d"
                position={OverlayPosition.BOTTOM_FULL_WIDTH}
                priority={1}
            >
                <div style={{ marginBottom: 20 }}>
                    <button onClick={toggleInsert} style={buttonStyles}>
                        {show ? 'Hide Overlay' : 'Add Overlay'}
                    </button>
                </div>
            </Overlay>
        </>
    );
};

export const SimpleTimeout = () => {
    const [id, setId] = useState(0);

    useEffect(() => {
        setInterval(() => {
            setId((i) => i + 1);
        }, 4000);
    }, []);

    return (
        <Overlay
            key={id}
            id={id.toString()}
            position={OverlayPosition.TOP_FULL_WIDTH}
            priority={4}
            hideAfterMs={3000}
        >
            <PlaceholderFullWidthNotification id="a" bgColor={getRandCol()}>
                Overlay Number {id}
            </PlaceholderFullWidthNotification>
        </Overlay>
    );
};

export const ConstraintMaxItems = () => {
    const [overlays, setOverlays] = useState<
        Array<OverlayCreationRecord & { text: string; col: string }>
    >([]);

    useEffect(() => {
        let id = 0;
        setInterval(() => {
            setOverlays((o) => [
                ...o,
                {
                    text: new Date().toISOString(),
                    col: getRandCol(),
                    id: (++id).toString(),
                    position: OverlayPosition.TOP_FULL_WIDTH,
                    priority: 1,
                },
            ]);
        }, 500);
    }, []);

    const onOverlayRemoved = useCallback((id: OverlayId) => {
        setOverlays((o) => {
            return o.filter((ol) => ol.id !== id);
        });
    }, []);

    return (
        <>
            {overlays.map((o) => (
                <Overlay
                    key={o.id}
                    id={o.id}
                    position={o.position}
                    priority={o.priority}
                    onRemovedAfterConstraintViolation={onOverlayRemoved}
                >
                    <PlaceholderFullWidthNotification id="a" bgColor={o.col}>
                        {o.text}
                    </PlaceholderFullWidthNotification>
                </Overlay>
            ))}
        </>
    );
};

export const SimplePriority = () => {
    const { removeOverlay } = useContext(OverlayContext);
    const [show, setShow] = useState(false);
    const toggleInsert = () => {
        removeOverlay('e').then(() => {
            setShow((s) => !s);
        });
    };

    const aCol = useMemo(getRandCol, []);
    const bCol = useMemo(getRandCol, []);
    const cCol = useMemo(getRandCol, []);
    const dCol = useMemo(getRandCol, []);
    const eCol = useMemo(getRandCol, []);

    return (
        <>
            <Overlay
                id="a"
                position={OverlayPosition.TOP_FULL_WIDTH}
                priority={4}
            >
                <PlaceholderFullWidthNotification id="a" bgColor={aCol}>
                    Priority 4
                </PlaceholderFullWidthNotification>
            </Overlay>
            <Overlay
                id="b"
                position={OverlayPosition.TOP_FULL_WIDTH}
                priority={2}
            >
                <PlaceholderFullWidthNotification id="b" bgColor={bCol}>
                    Priority 2
                </PlaceholderFullWidthNotification>
            </Overlay>
            <Overlay
                id="c"
                position={OverlayPosition.TOP_FULL_WIDTH}
                priority={1}
            >
                <PlaceholderFullWidthNotification id="c" bgColor={cCol}>
                    Priority 1
                </PlaceholderFullWidthNotification>
            </Overlay>
            {show && (
                <Overlay
                    id="e"
                    position={OverlayPosition.TOP_FULL_WIDTH}
                    priority={3}
                >
                    <PlaceholderFullWidthNotification id="e" bgColor={eCol}>
                        Priority 3
                    </PlaceholderFullWidthNotification>
                </Overlay>
            )}
            <Overlay
                id="d"
                position={OverlayPosition.BOTTOM_FULL_WIDTH}
                priority={1}
            >
                <div style={{ marginBottom: 20 }}>
                    <button onClick={toggleInsert} style={buttonStyles}>
                        {show
                            ? 'Hide Overlay With Priority 3'
                            : 'Add Overlay With Priority 3'}
                    </button>
                </div>
            </Overlay>
        </>
    );
};

const Story = () => {
    const [overlays, setOverlays] =
        useState<
            Array<Omit<OverlayProps, 'children'> & RandomizablePlaceholderProps>
        >(mockOverlays);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setOverlays((o) => {
                const action = getRandomEvent(overlays.length, o);
                return applyRandomActionToOverlays(action, o);
            });
        }, 500);

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

export const SimpleStory = () => {
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

export const InsetStory = () => {
    const { setInset, recalculateInsets, clear } = useContext(OverlayContext);
    const [overlays, setOverlays] = useState<
        Array<Omit<OverlayProps, 'children'> & RandomizablePlaceholderProps>
    >(mockOverlays.slice(0, 6));

    useEffect(() => {
        const container = document.querySelector('.story-wrap') as HTMLElement;
        if (container) {
            container.style.overflow = 'visible';
            document.body.style.backgroundColor = '#6c5ce7';
        }

        window.addEventListener('scroll', recalculateInsets);

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
            {overlays
                .map((o) => {
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
                })
                .slice(-1)}
        </div>
    );
};
export const ResponsiveStory = () => {
    return (
        <>
            <Overlay id="a" position={OverlayPosition.TOP_LEFT} priority={0}>
                <PlaceholderNotification id="a" bgColor={'pink'}>
                    Overlay A
                </PlaceholderNotification>
            </Overlay>
            <Overlay id="b" position={OverlayPosition.TOP_CENTER} priority={1}>
                <PlaceholderNotification id="b" bgColor={'green'}>
                    Overlay B
                </PlaceholderNotification>
            </Overlay>
            <Overlay id="c" position={OverlayPosition.TOP_RIGHT} priority={2}>
                <PlaceholderNotification id="c" bgColor={'orange'}>
                    Overlay C
                </PlaceholderNotification>
            </Overlay>
        </>
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
