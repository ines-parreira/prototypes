import {AlertBannerTypes} from './types'

export const BANNER_TYPE_HIERARCHY = {
    [AlertBannerTypes.Info]: AlertBannerTypes.Warning,
    [AlertBannerTypes.Warning]: AlertBannerTypes.Critical,
    [AlertBannerTypes.Critical]: undefined,
}
