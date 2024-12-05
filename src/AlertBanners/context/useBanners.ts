import {useContext, useMemo} from 'react'

import {BannerActionTypes, BannerCategory, ContextBanner} from '../types'
import {BannersDispatchContext} from './BannerContext'

// Abstracts the dispatch logic away
export function useBanners() {
    const dispatch = useContext(BannersDispatchContext)
    return useMemo(
        () => ({
            addBanner: (payload: ContextBanner) => {
                dispatch({type: BannerActionTypes.ADD, payload})
            },
            forceAddBanner: (payload: ContextBanner) => {
                dispatch({type: BannerActionTypes.FORCE_ADD, payload})
            },
            removeCategory: (category: BannerCategory) => {
                dispatch({type: BannerActionTypes.REMOVE_CATEGORY, category})
            },
            removeBanner: (category: BannerCategory, instanceId: string) => {
                dispatch({
                    type: BannerActionTypes.REMOVE_BANNER,
                    category,
                    instanceId,
                })
            },
            dismissBanner: (category: BannerCategory, instanceId: string) => {
                dispatch({
                    type: BannerActionTypes.DISMISS_BANNER,
                    category,
                    instanceId,
                })
            },
        }),
        [dispatch]
    )
}
