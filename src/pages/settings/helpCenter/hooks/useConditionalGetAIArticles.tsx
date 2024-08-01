import {useFlags} from 'launchdarkly-react-client-sdk'
import {useMemo} from 'react'
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
    helpCenterId: number | null
    storeIntegrationId: number | null
    locale: LocaleCode
    enabled?: boolean
}

export const useConditionalGetAIArticles = ({
    helpCenterId,
    storeIntegrationId,
    locale,
    enabled,
}: Props) => {
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
            ...(enabled !== undefined ? {enabled} : {}),
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
            ...(enabled !== undefined ? {enabled} : {}),
        }
    )

    const isLoading = isAIArticlesForMultiStoreEnabled
        ? isLoadingWithMultiStoreEnabled
        : isLoadingWithMultiStoreDisabled

    const fetchedArticles: FetchedArticles = useMemo(() => {
        if (enabled === false) {
            return null
        }

        if (
            isAIArticlesForMultiStoreEnabled &&
            !isLoadingWithMultiStoreEnabled
        ) {
            return aiArticlesWithMultiStoreEnabled ?? null
        }

        if (
            !isAIArticlesForMultiStoreEnabled &&
            !isLoadingWithMultiStoreDisabled
        ) {
            return aiArticlesWithMultiStoreDisabled ?? null
        }

        return null
    }, [
        isAIArticlesForMultiStoreEnabled,
        isLoadingWithMultiStoreEnabled,
        isLoadingWithMultiStoreDisabled,
        aiArticlesWithMultiStoreEnabled,
        aiArticlesWithMultiStoreDisabled,
        enabled,
    ])

    return {fetchedArticles, isLoading}
}
