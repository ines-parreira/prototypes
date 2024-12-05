import React, {ReactNode, createContext, useContext, useReducer} from 'react'

import {BannerActions, ContextBanner} from '../types'
import {bannersReducer} from './reducer'

export const BannersContext = createContext<ContextBanner[]>([])
export const BannersDispatchContext = createContext<
    React.Dispatch<BannerActions>
>(() => undefined)

export function useBannerContext() {
    return useContext(BannersContext)
}

export function BannersContextProvider({children}: {children: ReactNode}) {
    const [banners, bannersDispatch] = useReducer(bannersReducer, [])

    return (
        <BannersContext.Provider value={banners}>
            <BannersDispatchContext.Provider value={bannersDispatch}>
                {children}
            </BannersDispatchContext.Provider>
        </BannersContext.Provider>
    )
}
