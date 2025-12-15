import React, { createContext, useContext, ReactNode } from 'react';

const ReadOnlyContext = createContext<boolean>(false);

export const useReadOnly = () => useContext(ReadOnlyContext);

interface ReadOnlyProviderProps {
    children: ReactNode;
    value: boolean;
}

export const ReadOnlyProvider: React.FC<ReadOnlyProviderProps> = ({ children, value }) => (
    <ReadOnlyContext.Provider value={value}>
        {children}
    </ReadOnlyContext.Provider>
);
