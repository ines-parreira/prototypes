import {BannerActionTypes, BannerActions, ContextBanner} from '../types'

function isAlreadyInState(banners: ContextBanner[], newBanner: ContextBanner) {
    return banners.some(
        (banner) =>
            banner.category === newBanner.category &&
            banner.instanceId === newBanner.instanceId
    )
}
export function bannersReducer(
    banners: ContextBanner[],
    action: BannerActions
) {
    switch (action.type) {
        case BannerActionTypes.ADD: {
            // TODO: Session storage management
            if (isAlreadyInState(banners, action.payload)) {
                return banners
            }
            return [...banners, {...action.payload}]
        }
        case BannerActionTypes.FORCE_ADD: {
            if (isAlreadyInState(banners, action.payload)) {
                return banners
            }
            return [...banners, {...action.payload}]
        }
        case BannerActionTypes.REMOVE_CATEGORY: {
            return [
                ...banners.filter(
                    (banner) => banner.category !== action.category
                ),
            ]
        }
        case BannerActionTypes.REMOVE_BANNER: {
            return [
                ...banners.filter(
                    (banner) =>
                        banner.category !== action.category &&
                        banner.instanceId !== action.instanceId
                ),
            ]
        }
        case BannerActionTypes.DISMISS_BANNER: {
            // TODO: Session storage management
            return [
                ...banners.filter(
                    (banner) =>
                        banner.category !== action.category ||
                        banner.instanceId !== action.instanceId
                ),
            ]
        }
    }
}
