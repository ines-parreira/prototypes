import type { ReactNode } from 'react'
import React, { useReducer } from 'react'

import { BannersContext, BannersDispatchContext } from '../context'
import { bannersReducer } from '../reducer'

export function BannersContextProvider({ children }: { children: ReactNode }) {
    const [banners, bannersDispatch] = useReducer(bannersReducer, [])

    return (
        <BannersContext.Provider value={banners}>
            <BannersDispatchContext.Provider value={bannersDispatch}>
                {children}
            </BannersDispatchContext.Provider>
        </BannersContext.Provider>
    )
}
