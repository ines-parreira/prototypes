import { useEffect, useState } from 'react'

import { HelpCenter } from 'models/helpCenter/types'
import { StoreIntegration } from 'models/integration/types'
import { useGetAIArticles } from 'pages/settings/helpCenter/hooks/useGetAIArticles'

import { useHasEmailToStoreConnection } from './useHasEmailToStoreConnection'
import { StoreWithHelpCenters } from './useTopQuestionsStoresWithHelpCenters'
import { isAIArticleWithoutReviewAction } from './utils'

type FirstMatchingStoreAndHelpCenter = {
    firstMatchingStore: StoreIntegration
    firstMatchingHelpCenter: HelpCenter
}

export const useFirstStoreAndHelpCenterWithTopQuestions = (
    storesWithHelpCenters: StoreWithHelpCenters[],
    enabled: boolean,
): {
    isLoading: boolean
    firstMatchingStoreAndHelpCenter: FirstMatchingStoreAndHelpCenter | undefined
} => {
    const [[storeIndex, helpCenterIndex], setStoreAndHelpCenterIndex] =
        useState([0, 0])

    const [
        firstMatchingStoreAndHelpCenter,
        setFirstMatchingStoreAndHelpCenter,
    ] = useState<FirstMatchingStoreAndHelpCenter | undefined>(undefined)

    const store: StoreWithHelpCenters | null =
        storesWithHelpCenters[storeIndex] ?? null
    const helpCenter: HelpCenter | null =
        store?.helpCenters[helpCenterIndex] ?? null

    const {
        hasEmailToStoreConnection,
        isLoading: isLoadingEmailToStoreConnection,
    } = useHasEmailToStoreConnection(store?.store?.id)

    const disableRequest =
        firstMatchingStoreAndHelpCenter !== undefined ||
        !enabled ||
        !store ||
        !helpCenter ||
        !hasEmailToStoreConnection ||
        isLoadingEmailToStoreConnection

    const { fetchedArticles, isLoading: isLoadingAIArticles } =
        useGetAIArticles({
            helpCenterId: helpCenter?.id ?? null,
            storeIntegrationId: store?.store.id ?? null,
            locale: helpCenter?.default_locale ?? 'en-US',
            ...(disableRequest ? { enabled: false } : {}),
        })

    useEffect(() => {
        if (
            isLoadingEmailToStoreConnection ||
            isLoadingAIArticles ||
            !enabled ||
            !store ||
            !helpCenter ||
            firstMatchingStoreAndHelpCenter !== undefined
        ) {
            return
        }

        const filteredArticles = fetchedArticles
            ? fetchedArticles.filter(isAIArticleWithoutReviewAction)
            : []

        if (filteredArticles.length === 0) {
            if (helpCenterIndex < store.helpCenters.length - 1) {
                setStoreAndHelpCenterIndex([storeIndex, helpCenterIndex + 1])
            } else if (storeIndex < storesWithHelpCenters.length - 1) {
                setStoreAndHelpCenterIndex([storeIndex + 1, 0])
            } else {
                setStoreAndHelpCenterIndex([-1, -1])
            }
        } else {
            setFirstMatchingStoreAndHelpCenter({
                firstMatchingStore: store.store,
                firstMatchingHelpCenter: helpCenter,
            })
        }
    }, [
        fetchedArticles,
        helpCenterIndex,
        storeIndex,
        helpCenter,
        store,
        isLoadingAIArticles,
        storesWithHelpCenters,
        firstMatchingStoreAndHelpCenter,
        isLoadingEmailToStoreConnection,
        enabled,
    ])

    return {
        isLoading: isLoadingAIArticles || isLoadingEmailToStoreConnection,
        firstMatchingStoreAndHelpCenter,
    }
}
