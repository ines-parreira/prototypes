import React, {ReactNode} from 'react'

import useHasCanduContent from 'hooks/candu/useHasCanduContent'

import CanduContext from './CanduContext'

const CANDU_ID = 'navbar-dropdown'

export default function CanduProvider({children}: {children: ReactNode}) {
    const {hasCanduContent, ref} = useHasCanduContent<HTMLDivElement>(CANDU_ID)

    return (
        <CanduContext.Provider value={hasCanduContent}>
            <div
                ref={ref}
                data-candu-id={CANDU_ID}
                data-testid="candu-hidden-link"
                style={{
                    display: 'none',
                }}
            />
            {children}
        </CanduContext.Provider>
    )
}
