import * as React from 'react';

export interface PlaceholderProps extends RandomizablePlaceholderProps {
    id: string;
}

export interface RandomizablePlaceholderProps {
    bgColor: string;
}

export const PlaceholderNotification: React.FC<PlaceholderProps> = ({
    id,
    bgColor,
}) => {
    return (
        <div
            style={{
                width: 280,
                padding: 10,
                borderRadius: 8,
                border: '3px solid black',
                boxSizing: 'border-box',
                margin: 5,
                backgroundColor: bgColor,
                display: 'flex',
                flexDirection: 'row',
            }}
        >
            <div
                style={{
                    flex: '0 0 auto',
                }}
            >
                <img
                    style={{
                        width: 40,
                        height: 40,
                        margin: 0,
                        padding: 0,
                    }}
                    src={`https://joeschmoe.io/api/v1/${id}`}
                />
            </div>
            <div
                style={{
                    flex: '1 1 auto',
                    marginLeft: 10,
                }}
            >
                <div
                    style={{
                        height: 15,
                        width: '70%',
                        backgroundColor: 'black',
                        borderRadius: 4,
                    }}
                ></div>
                <div
                    style={{
                        height: 15,
                        width: '40%',
                        backgroundColor: 'black',
                        marginTop: 5,
                        borderRadius: 4,
                    }}
                ></div>
            </div>
        </div>
    );
};

export const PlaceholderFullWidthNotification: React.FC<PlaceholderProps> = ({
    id,
    bgColor,
}) => {
    return (
        <div
            style={{
                padding: 10,
                borderRadius: 8,
                border: '3px solid black',
                boxSizing: 'border-box',
                margin: 5,
                backgroundColor: bgColor,
                display: 'flex',
                flexDirection: 'row',
            }}
        >
            <div
                style={{
                    flex: '0 0 auto',
                }}
            >
                <img
                    style={{
                        width: 40,
                        height: 40,
                        margin: 0,
                        padding: 0,
                    }}
                    src={`https://joeschmoe.io/api/v1/${id}`}
                />
            </div>
            <div
                style={{
                    flex: '1 1 auto',
                    marginLeft: 10,
                }}
            >
                <div
                    style={{
                        height: 15,
                        width: '70%',
                        backgroundColor: 'gray',
                        borderRadius: 4,
                    }}
                ></div>
                <div
                    style={{
                        height: 15,
                        width: '40%',
                        backgroundColor: 'gray',
                        marginTop: 5,
                        borderRadius: 4,
                    }}
                ></div>
            </div>
        </div>
    );
};
