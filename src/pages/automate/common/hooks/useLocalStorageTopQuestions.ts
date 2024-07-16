import {useMemo} from 'react'
import {fromPairs} from 'lodash'
import useLocalStorage from 'hooks/useLocalStorage'
import useEffectOnce from 'hooks/useEffectOnce'

export type PagesWithTopQuestions = 'automate-overview' | 'all-recommendations'

export type TopQuestions = {
    viewedOnPages: Set<PagesWithTopQuestions>
    addViewedOnPage: (page: PagesWithTopQuestions) => void
}

export const useLocalStorageTopQuestions = (
    storeIntegrationId: number,
    helpCenterId: number,
    batchDatetime: Date
): TopQuestions => {
    const [storedValues, setStoredValues] =
        useLocalStorage<LocalStorageTopQuestionsBatches>(LOCAL_STORAGE_KEY)

    useEffectOnce(() => {
        if (storedValues) {
            setStoredValues(removeOldValues(storedValues))
        }
    })

    const key = useMemo(
        () => `key-${storeIntegrationId}-${helpCenterId}`,
        [storeIntegrationId, helpCenterId]
    )

    const currentBatch = useMemo(
        () => getNonExpiredBatchOrNew(storedValues, key, batchDatetime),
        [storedValues, key, batchDatetime]
    )

    return {
        viewedOnPages: new Set(currentBatch.viewedOnPages),
        addViewedOnPage: (page) => {
            setStoredValues((previousBatches) => {
                const currentBatch = getNonExpiredBatchOrNew(
                    previousBatches,
                    key,
                    batchDatetime
                )

                return {
                    ...previousBatches,
                    [key]: {
                        ...currentBatch,
                        viewedOnPages: [...currentBatch.viewedOnPages, page],
                    },
                }
            })
        },
    }
}

const LOCAL_STORAGE_KEY = 'gorgias-aao-top-questions'

const STORAGE_EXPIRATION_DELTA_MS = 1000 * 60 * 60 * 24 * 365 // 1 year

type LocalStorageTopQuestionsBatches = Record<
    string,
    {
        latestBatchDatetime: string
        viewedOnPages: PagesWithTopQuestions[]
    }
>

type LocalStorageTopQuestionsBatch = LocalStorageTopQuestionsBatches[string]

const removeOldValues = (values: LocalStorageTopQuestionsBatches) => {
    const oneYearAgoMs = new Date().getTime() - STORAGE_EXPIRATION_DELTA_MS

    return fromPairs(
        Object.entries(values).filter(
            ([__key, {latestBatchDatetime}]) =>
                new Date(latestBatchDatetime).getTime() > oneYearAgoMs
        )
    )
}

const getNonExpiredBatchOrNew = (
    batches: LocalStorageTopQuestionsBatches | undefined,
    key: string,
    batchDatetime: Date
): LocalStorageTopQuestionsBatch => {
    const existingBatch = (batches ?? {})[key]

    if (
        existingBatch &&
        new Date(existingBatch.latestBatchDatetime) >= batchDatetime
    ) {
        return existingBatch
    }

    return {
        viewedOnPages: [],
        latestBatchDatetime: batchDatetime.toISOString(),
    }
}
