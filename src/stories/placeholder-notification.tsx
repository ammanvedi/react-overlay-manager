import * as React from 'react';
import {
    notificationContainer,
    notificationImg,
    notificationImgContainer,
    notificationText,
    notificationTextBottom,
    notificationTextContainer,
    notificationTextTop,
} from './styles';

export interface PlaceholderProps extends RandomizablePlaceholderProps {
    id: string;
}

export interface RandomizablePlaceholderProps {
    bgColor: string;
}

export const PlaceholderNotification: React.FC<PlaceholderProps> = ({
    id,
    bgColor,
    children,
}) => {
    return (
        <div
            style={{
                ...notificationContainer,
                backgroundColor: bgColor,
            }}
        >
            <div style={notificationImgContainer}>
                <img
                    style={notificationImg}
                    src={`https://joeschmoe.io/api/v1/${id}`}
                />
            </div>
            <div style={notificationTextContainer}>
                {children ? (
                    <div style={notificationText}>{children}</div>
                ) : (
                    <>
                        <div style={notificationTextTop} />
                        <div style={notificationTextBottom} />
                    </>
                )}
            </div>
        </div>
    );
};

export const PlaceholderFullWidthNotification: React.FC<PlaceholderProps> = ({
    id,
    bgColor,
    children,
}) => {
    return (
        <div
            style={{
                ...notificationContainer,
                width: 'auto',
                backgroundColor: bgColor,
            }}
        >
            <div style={notificationImgContainer}>
                <img
                    style={notificationImg}
                    src={`https://joeschmoe.io/api/v1/${id}`}
                />
            </div>
            <div style={notificationTextContainer}>
                {children ? (
                    <div style={notificationText}>{children}</div>
                ) : (
                    <>
                        <div style={notificationTextTop} />
                        <div style={notificationTextBottom} />
                    </>
                )}
            </div>
        </div>
    );
};
