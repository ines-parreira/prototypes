import {BannerCategory} from '../../types'
import {AlertBannerStorage} from '../types'

export function isBannerDismissed(
    storage: AlertBannerStorage,
    category: BannerCategory,
    instanceId: string
) {
    return storage[category]?.dismissedInstances.includes(instanceId) || false
}
