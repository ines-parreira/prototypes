import type { ContextBanner } from '../types'
import { AlertBannerTypes } from '../types'
import { getBannerInsertionIndex } from './helpers/getBannerInsertionIndex'
import type { BannerActions } from './types'
import { BannerActionTypes } from './types'

function isInState(
    banners: ContextBanner[],
    category: ContextBanner['category'],
    instanceId?: ContextBanner['instanceId'],
) {
    return banners.some(
        (banner) =>
            banner.category === category &&
            (typeof instanceId !== 'undefined'
                ? banner.instanceId === instanceId
                : true),
    )
}

export function bannersReducer(
    banners: ContextBanner[],
    action: BannerActions,
) {
    switch (action.type) {
        case BannerActionTypes.ADD: {
            if (
                isInState(
                    banners,
                    action.payload.category,
                    action.payload.instanceId,
                )
            ) {
                return banners
            }
            if (banners.length === 0) {
                return [{ ...action.payload }]
            }

            const insertionIndex = getBannerInsertionIndex(
                banners,
                action.payload.type || AlertBannerTypes.Info,
            )
            return [
                ...banners.slice(0, insertionIndex),
                { ...action.payload },
                ...banners.slice(insertionIndex),
            ]
        }
        case BannerActionTypes.REMOVE_CATEGORY: {
            if (!isInState(banners, action.category)) return banners

            return banners.filter(
                (banner) => banner.category !== action.category,
            )
        }
        case BannerActionTypes.REMOVE_BANNER: {
            if (!isInState(banners, action.category, action.instanceId))
                return banners

            return banners.filter(
                (banner) =>
                    banner.category !== action.category ||
                    banner.instanceId !== action.instanceId,
            )
        }
    }
}
