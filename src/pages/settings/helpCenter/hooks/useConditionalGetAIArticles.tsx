import {useFlags} from 'launchdarkly-react-client-sdk'
import {useEffect, useState} from 'react'
import {FeatureFlagKey} from 'config/featureFlags'
import {LocaleCode} from 'models/helpCenter/types'
import {doNotRetry40XErrorsHandler} from 'api/utils'
import {
    useGetAIArticlesByHelpCenter,
    useGetAIArticlesByHelpCenterAndStore,
} from '../queries'
import {
    getAIGeneratedArticlesByHelpCenter,
    getAIGeneratedArticlesByHelpCenterAndStore,
} from '../resources'

type AIArticlesByHelpCenter = Awaited<
    ReturnType<typeof getAIGeneratedArticlesByHelpCenter>
>
type AIArticlesByHelpCenterAndStore = Awaited<
    ReturnType<typeof getAIGeneratedArticlesByHelpCenterAndStore>
>

type FetchedArticles =
    | AIArticlesByHelpCenter
    | AIArticlesByHelpCenterAndStore
    | null

type Props = {
    helpCenterId: number
    storeIntegrationId: number | null
    locale: LocaleCode
}

export const useConditionalGetAIArticles = ({
    helpCenterId,
    storeIntegrationId,
    locale,
}: Props) => {
    const [fetchedArticles, setFetchedArticles] =
        useState<FetchedArticles>(null)
    const [isLoading, setIsLoading] = useState(false)

    const isAIArticlesForMultiStoreEnabled =
        useFlags()[
            FeatureFlagKey.ObservabilityAllowAIGeneratedArticlesForMultiStore
        ]

    const {
        data: aiArticlesWithMultiStoreEnabled,
        isInitialLoading: isLoadingWithMultiStoreEnabled,
    } = useGetAIArticlesByHelpCenterAndStore(
        helpCenterId,
        storeIntegrationId,
        locale,
        isAIArticlesForMultiStoreEnabled,
        {
            refetchOnWindowFocus: false,
            retry: doNotRetry40XErrorsHandler,
        }
    )

    const {
        data: aiArticlesWithMultiStoreDisabled,
        isInitialLoading: isLoadingWithMultiStoreDisabled,
    } = useGetAIArticlesByHelpCenter(
        helpCenterId,
        locale,
        isAIArticlesForMultiStoreEnabled,
        {
            refetchOnWindowFocus: false,
            retry: doNotRetry40XErrorsHandler,
        }
    )

    useEffect(() => {
        if (isAIArticlesForMultiStoreEnabled) {
            setFetchedArticles(aiArticlesWithMultiStoreEnabled ?? null)
            setIsLoading(isLoadingWithMultiStoreEnabled)
        } else {
            setFetchedArticles(aiArticlesWithMultiStoreDisabled ?? null)
            setIsLoading(isLoadingWithMultiStoreDisabled)
        }
    }, [
        aiArticlesWithMultiStoreDisabled,
        aiArticlesWithMultiStoreEnabled,
        isAIArticlesForMultiStoreEnabled,
        isLoadingWithMultiStoreDisabled,
        isLoadingWithMultiStoreEnabled,
    ])

    return {fetchedArticles, isLoading}
}
