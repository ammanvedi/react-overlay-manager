import { OverlayProps } from '../overlay';
import { OverlayPosition } from '../types';
import { RandomizablePlaceholderProps } from './placeholder-notification';

type MoveAction = {
    type: 'move';
    index: number;
    destination: OverlayPosition;
    priority: number;
};

type RandomAction = MoveAction;

const randomValue = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min) + min);
};

const positions: Array<OverlayPosition> = [
    OverlayPosition.TOP_RIGHT,
    OverlayPosition.TOP_LEFT,
    OverlayPosition.TOP_CENTER,
    OverlayPosition.BOTTOM_CENTER,
    OverlayPosition.BOTTOM_RIGHT,
    OverlayPosition.BOTTOM_LEFT,
    OverlayPosition.TOP_FULL_WIDTH,
    OverlayPosition.BOTTOM_FULL_WIDTH,
];

const randomisePosition = (
    o: Omit<OverlayProps, 'children'> & RandomizablePlaceholderProps,
): OverlayPosition => {
    const positionsWithoutCurrent = positions.filter((p) => p !== o.position);
    switch (o.position) {
        default:
            return positionsWithoutCurrent[
                randomValue(0, positionsWithoutCurrent.length)
            ];
    }
};

export const getRandomEvent = (
    maxOverlays: number,
    o: Array<Omit<OverlayProps, 'children'> & RandomizablePlaceholderProps>,
): RandomAction => {
    const ix = randomValue(0, maxOverlays);
    return {
        type: 'move',
        index: ix,
        destination: randomisePosition(o[ix]),
        priority: randomValue(0, 10),
    };
};

export const applyRandomActionToOverlays = (
    action: RandomAction,
    overlays: Array<
        Omit<OverlayProps, 'children'> & RandomizablePlaceholderProps
    >,
): Array<Omit<OverlayProps, 'children'> & RandomizablePlaceholderProps> => {
    const result = [...overlays];
    switch (action.type) {
        case 'move':
            result[action.index] = {
                ...result[action.index],
                position: action.destination,
                priority: action.priority,
            };
            return result;
    }
};

const colors = [
    '#00b894',
    '#0984e3',
    '#fdcb6e',
    '#e17055',
    '#e84393',
    '#b2bec3',
    '#00cec9',
];

export const getRandCol = () => {
    return colors[randomValue(0, colors.length)];
};

export const mockOverlays: Array<
    Omit<OverlayProps, 'children'> & RandomizablePlaceholderProps
> = [
    {
        id: 'c',
        position: OverlayPosition.TOP_LEFT,
        priority: 1,
    },
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
    {
        id: 'q',
        position: OverlayPosition.BOTTOM_RIGHT,
        priority: 1,
    },
]
    .map((i) => {
        return {
            ...i,
            bgColor: getRandCol(),
        };
    })
    .slice(0, 11);
