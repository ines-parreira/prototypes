import {useEffect} from 'react'

import {useBannersContext} from '../../ccontext'
import {BannerCategory} from '../../types'

import {AlertBannerStorage} from '../types'

export function useStorageSync(
    storage: AlertBannerStorage,
    updateCurrentTabState: (
        category: BannerCategory,
        instanceId: string
    ) => void
) {
    const banners = useBannersContext()
    // If the storage is updated from another tab, we want to
    // have the possibility to update state in the current tab
    useEffect(() => {
        Object.entries(storage).forEach(([category, {dismissedInstances}]) => {
            dismissedInstances.forEach((instanceId) => {
                if (
                    banners.some(
                        (banner) =>
                            banner.category === category &&
                            banner.instanceId === instanceId
                    )
                ) {
                    updateCurrentTabState(
                        category as BannerCategory,
                        instanceId
                    )
                }
            })
        })
    }, [storage, banners, updateCurrentTabState])
}
