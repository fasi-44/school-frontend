// context/FullscreenContext.js
import React, { createContext, useContext } from 'react';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';

const FullscreenContext = createContext();

export const useFullscreen = () => useContext(FullscreenContext);

export function FullscreenProvider({ children }) {
    const handle = useFullScreenHandle();

    return (
        <FullscreenContext.Provider value={handle}>
            <FullScreen handle={handle}>
                <div className="fullscreen-wrapper">
                    {children}
                </div>
            </FullScreen>
        </FullscreenContext.Provider>
    );
}
