import { AlertBannerTypes, ContextBanner } from '../../types'

const getNextBannerType = (
    type: AlertBannerTypes,
): AlertBannerTypes | undefined => {
    switch (type) {
        case AlertBannerTypes.Info:
            return AlertBannerTypes.Warning
        case AlertBannerTypes.Warning:
            return AlertBannerTypes.Critical
        case AlertBannerTypes.Critical:
            return undefined
        default:
            return undefined
    }
}

/**
 * Banners are sorted by types, in the follow order: [Critical, Warning, Info]
 * New banner of a type is inserted before any other banner of that type.
 * So we must find the index of the first banner of the same type,
 * and insert it before it. If not, we insert it after the last banner of the
 * previous type. If there is no previous type, we insert at the beginning.
 * Unknown types are treated as Info level banners.
 **/
export function getBannerInsertionIndex(
    banners: ContextBanner[],
    type: AlertBannerTypes,
    findLastIndex: boolean = false,
) {
    const indexMethod = findLastIndex ? 'findLastIndex' : 'findIndex'
    const typeIndex = banners[indexMethod as 'findIndex']((banner) => {
        return banner.type === type
    })

    if (typeIndex > -1) return findLastIndex ? typeIndex + 1 : typeIndex

    const nextType = getNextBannerType(type)
    // We're at the top, insert at the beginning
    if (!nextType) return 0
    // Otherwise, insert at the end of the next type
    return getBannerInsertionIndex(banners, nextType, true)
}
