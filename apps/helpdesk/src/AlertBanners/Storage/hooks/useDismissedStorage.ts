import { useCallback, useRef } from 'react'

import { useLocalStorage } from '@repo/hooks'

import type { BannerCategory } from '../../types'
import { DISMISSED_BANNER_STORAGE_KEY } from '../constants'
import { isBannerDismissed as isBannerDismissedInternal } from '../helpers/isBannerDismissed'
import type { AlertBannerStorage } from '../types'
import { useStorageCleanup } from './useStorageCleanup'
import { useStorageSync } from './useStorageSync'

export function useDismissedStorage(
    updateCurrentTabState: (
        category: BannerCategory,
        instanceId: string,
    ) => void,
) {
    const [storage, setStorage] = useLocalStorage<AlertBannerStorage>(
        DISMISSED_BANNER_STORAGE_KEY,
        {},
    )

    // This workaround makes isBannerDismissed stable across storage changes
    const storageRef = useRef(storage)
    storageRef.current = storage

    useStorageCleanup(storage, setStorage)
    useStorageSync(storage, updateCurrentTabState)

    const isBannerDismissed = useCallback(
        (category: BannerCategory, instanceId: string) =>
            isBannerDismissedInternal(storageRef.current, category, instanceId),
        [],
    )

    const setDismissed = useCallback(
        (category: BannerCategory, instanceId: string) => {
            setStorage((prevStorage) => {
                const newStorage = {
                    ...prevStorage,
                    [category]: {
                        dismissedInstances: [
                            ...(prevStorage[category]?.dismissedInstances ||
                                []),
                            instanceId,
                        ],
                        lastUpdate: Date.now(),
                    },
                }
                return newStorage
            })
        },
        [setStorage],
    )

    return { setDismissed, isBannerDismissed }
}
