import React from 'react';

export const buttonStyles: React.CSSProperties = {
    display: 'block',
    margin: '0px auto',
    appearance: 'none',
    border: '3px solid black',
    borderRadius: 6,
    fontFamily: 'Helvetica, sans-serif',
    fontWeight: 'bold',
    fontSize: 19,
    padding: '10px 23px',
    background: 'deepskyblue',
    cursor: 'pointer',
};

export const notificationContainer: React.CSSProperties = {
    minWidth: 280,
    padding: 10,
    borderRadius: 8,
    border: '3px solid black',
    boxSizing: 'border-box',
    margin: 5,
    display: 'flex',
    flexDirection: 'row',
};

export const notificationImgContainer: React.CSSProperties = {
    flex: '0 0 auto',
};

export const notificationTextContainer: React.CSSProperties = {
    flex: '1 1 auto',
    marginLeft: 10,
};

export const notificationImg: React.CSSProperties = {
    width: 40,
    height: 40,
    margin: 0,
    padding: 0,
};

export const notificationText: React.CSSProperties = {
    fontFamily: 'helvetica, arial, sans-serif',
    fontWeight: 'bold',
    color: '#212121',
};

export const notificationTextTop: React.CSSProperties = {
    height: 15,
    width: '70%',
    backgroundColor: 'black',
    borderRadius: 4,
};

export const notificationTextBottom: React.CSSProperties = {
    height: 15,
    width: '40%',
    backgroundColor: 'black',
    marginTop: 5,
    borderRadius: 4,
};
