import {useCallback, useEffect, useMemo, useRef} from 'react'
import {fromPairs} from 'lodash'
import useLocalStorage from 'hooks/useLocalStorage'
import useEffectOnce from 'hooks/useEffectOnce'
import usePrevious from 'hooks/usePrevious'

export type PagesWithTopQuestions = 'automate-overview' | 'all-recommendations'

export const useTopQuestionsViewedOnPage = (
    storeIntegrationId: number,
    helpCenterId: number,
    page: PagesWithTopQuestions,
    batchDatetime: Date
): boolean => {
    const previousStoreIntegrationId = usePrevious(storeIntegrationId)
    const previousHelpCenterId = usePrevious(helpCenterId)
    const previousPage = usePrevious(page)

    const [localStorageBatches, setLocalStorageBatches] =
        useLocalStorage<LocalStorageTopQuestionsBatches>(LOCAL_STORAGE_KEY)

    useEffectOnce(() => {
        setLocalStorageBatches(removeOldValues(localStorageBatches ?? {}))
    })

    const viewedOnPage = useMemo(
        () =>
            getNonExpiredBatchOrNew(
                storeIntegrationId,
                helpCenterId,
                batchDatetime,
                localStorageBatches
            ).viewedOnPages.includes(page),
        [
            storeIntegrationId,
            helpCenterId,
            batchDatetime,
            page,
            localStorageBatches,
        ]
    )

    const setViewedOnPage = useCallback(
        (
            storeIntegrationId: number,
            helpCenterId: number,
            page: PagesWithTopQuestions,
            batchDatetime: Date
        ) => {
            setLocalStorageBatches((previousBatches) => {
                const currentBatch = getNonExpiredBatchOrNew(
                    storeIntegrationId,
                    helpCenterId,
                    batchDatetime,
                    previousBatches
                )

                return {
                    ...previousBatches,
                    [makeKey(storeIntegrationId, helpCenterId)]: {
                        ...currentBatch,
                        viewedOnPages: Array.from(
                            new Set([...currentBatch.viewedOnPages, page])
                        ),
                    },
                }
            })
        },
        [setLocalStorageBatches]
    )

    useEffect(() => {
        if (
            previousStoreIntegrationId !== undefined &&
            previousHelpCenterId !== undefined &&
            previousPage !== undefined &&
            (previousStoreIntegrationId !== storeIntegrationId ||
                previousHelpCenterId !== helpCenterId ||
                previousPage !== page)
        ) {
            setViewedOnPage(
                previousStoreIntegrationId,
                previousHelpCenterId,
                previousPage,
                batchDatetime
            )
        }
    }, [
        storeIntegrationId,
        previousStoreIntegrationId,
        helpCenterId,
        previousHelpCenterId,
        batchDatetime,
        page,
        previousPage,
        setViewedOnPage,
    ])

    const setViewedOnLatestPage = useCallback(
        () =>
            setViewedOnPage(
                storeIntegrationId,
                helpCenterId,
                page,
                batchDatetime
            ),
        [storeIntegrationId, helpCenterId, page, batchDatetime, setViewedOnPage]
    )

    const setViewedOnLatestPageRef = useRef<() => void>(() => {})

    useEffect(() => {
        setViewedOnLatestPageRef.current = setViewedOnLatestPage
    }, [setViewedOnLatestPage])

    useEffect(() => {
        window.addEventListener('beforeunload', setViewedOnLatestPage)

        return () => {
            window.removeEventListener('beforeunload', setViewedOnLatestPage)
        }
    }, [setViewedOnLatestPage])

    useEffect(() => {
        return () => {
            setViewedOnLatestPageRef.current()
        }
    }, [])

    return viewedOnPage
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
    storeIntegrationId: number,
    helpCenterId: number,
    batchDatetime: Date,
    batches: LocalStorageTopQuestionsBatches | undefined
): LocalStorageTopQuestionsBatch => {
    const batchKey = makeKey(storeIntegrationId, helpCenterId)

    const existingBatch = (batches ?? {})[batchKey]

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

const makeKey = (storeIntegrationId: number, helpCenterId: number): string =>
    `key-${storeIntegrationId}-${helpCenterId}`
