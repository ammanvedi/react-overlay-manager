import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { OverlayContextProvider } from '../overlay-context';
import { ManagedOverlay } from '../managed-overlay';
import { OverlayPosition } from '../types';

export default {
    title: 'Overlay Manager',
    component: OverlayContextProvider,
} as ComponentMeta<any>;

const boxStyles: React.CSSProperties = {
    width: '100px',
    height: '100px',
    backgroundColor: 'blue',
    margin: '0',
};

export const Default = () => {
    return (
        <OverlayContextProvider>
            <div>Page Content</div>
            <ManagedOverlay position={OverlayPosition.TOP_RIGHT} id="1s">
                <div style={boxStyles}>Overlay One</div>
            </ManagedOverlay>
            <ManagedOverlay position={OverlayPosition.BOTTOM_CENTER} id="1s2">
                <div style={boxStyles}>Overlay One</div>
            </ManagedOverlay>
            <ManagedOverlay position={OverlayPosition.BOTTOM_RIGHT} id="1sdf">
                <div style={boxStyles}>Overlay One</div>
            </ManagedOverlay>
            <ManagedOverlay position={OverlayPosition.BOTTOM_LEFT} id="2">
                <div style={boxStyles}>Overlay Two</div>
            </ManagedOverlay>
            <ManagedOverlay position={OverlayPosition.BOTTOM_LEFT} id="2dffdss">
                <div style={boxStyles}>Overlay Two</div>
            </ManagedOverlay>
        </OverlayContextProvider>
    );
};
