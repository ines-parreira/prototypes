import { AlertBannerTypes } from './types'

export const typeFallbackBanner = (type: AlertBannerTypes | undefined) => {
    if (!type) {
        return AlertBannerTypes.Info
    }

    if (type === AlertBannerTypes.Critical) {
        return AlertBannerTypes.Error
    }

    return type
}
