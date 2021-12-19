import { OverlayProps } from '../overlay';
import { OverlayPosition } from '../types';

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
    OverlayPosition.TOP_FULL_WIDTH,
    OverlayPosition.BOTTOM_CENTER,
    OverlayPosition.BOTTOM_RIGHT,
    OverlayPosition.BOTTOM_LEFT,
    OverlayPosition.BOTTOM_FULL_WIDTH,
];

export const getRandomEvent = (maxOverlays: number): RandomAction => {
    return {
        type: 'move',
        index: randomValue(0, maxOverlays),
        destination: positions[randomValue(0, positions.length)],
        priority: randomValue(0, 10),
    };
};

export const applyRandomActionToOverlays = (
    action: RandomAction,
    overlays: Array<OverlayProps>,
): Array<OverlayProps> => {
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

export const mockOverlays: Array<OverlayProps> = [
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
    {
        id: 'q',
        position: OverlayPosition.BOTTOM_RIGHT,
        priority: 1,
    },
];
