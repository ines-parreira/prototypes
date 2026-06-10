import { produce } from 'immer'
import { useEffectOnce } from '@gorgias/toolkit-react'

import type { BannerCategory } from '../../types'
import { STORAGE_CLEAR_TIMEOUT } from '../constants'
import type { AlertBannerStorage } from '../types'

export function useStorageCleanup(
    storage: AlertBannerStorage,
    setStorage: (value: AlertBannerStorage) => void,
) {
    // Cleanup storage every now and then
    useEffectOnce(() => {
        const newStorage = produce(storage, (draft) => {
            Object.entries(draft).forEach(([category, { lastUpdate }]) => {
                if (Date.now() - lastUpdate > STORAGE_CLEAR_TIMEOUT) {
                    delete draft[category as BannerCategory]
                }
            })
        })
        setStorage(newStorage)
    })
}
