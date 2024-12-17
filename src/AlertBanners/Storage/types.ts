import {BannerCategory} from '../types'

export type AlertBannerStorage = {
    [key in BannerCategory]?: {
        lastUpdate: number
        dismissedInstances: string[]
    }
}
