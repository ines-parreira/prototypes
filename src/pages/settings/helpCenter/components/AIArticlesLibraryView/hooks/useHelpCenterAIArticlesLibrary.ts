import {useEffect, useMemo, useState} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {
    AIArticle,
    AIArticleToggleOptionValue,
    AILibraryArticleItem,
    ArticleTemplateReviewAction,
    Locale,
} from 'models/helpCenter/types'
import {useConditionalGetAIArticles} from 'pages/settings/helpCenter/hooks/useConditionalGetAIArticles'
import {useSelfServiceStoreIntegrationByShopName} from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import useAppSelector from 'hooks/useAppSelector'
import {useListStoreMappings} from 'models/storeMapping/queries'
import {StoreMapping} from 'models/storeMapping/types'
import * as integrationsSelectors from 'state/integrations/selectors'
import {isGenericEmailIntegration} from 'pages/integrations/integration/components/email/helpers'
import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import useShopifyIntegrations from 'pages/automate/common/hooks/useShopifyIntegrations'
import {FeatureFlagKey} from 'config/featureFlags'
import {mapAILibraryArticlesData} from '../AIArticlesLibraryUtils'
import {MINIMUM_AI_ARTICLES} from '../../CategoriesView/components/ArticleTemplateCard/constants'

export const useHelpCenterAIArticlesLibrary = (
    helpCenterId: number,
    locale: Locale['code'],
    helpCenterShopName: string | null
) => {
    const [articles, setArticles] = useState<AIArticle[] | null>(null)
    const [mappedArticleItems, setMappedArticleItems] = useState<
        AILibraryArticleItem[]
    >([])

    const integrations = useAppSelector(
        integrationsSelectors.getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES)
    )

    const emailIntegrations = useMemo(
        () => integrations.filter(isGenericEmailIntegration),
        [integrations]
    )
    const emailIntegrationIds = useMemo(
        () => emailIntegrations.map((emailIntegration) => emailIntegration.id),
        [emailIntegrations]
    )
    const {data: storeMapping} = useListStoreMappings(emailIntegrationIds, {
        refetchOnWindowFocus: false,
    })

    const storeIntegration = useSelfServiceStoreIntegrationByShopName(
        helpCenterShopName ?? ''
    )

    const hasEmailToStoreConnection = useMemo(
        () =>
            storeMapping?.some(
                (mapping: StoreMapping) =>
                    mapping.store_id === storeIntegration?.id
            ),
        [storeIntegration?.id, storeMapping]
    )

    const isAIArticlesForMultiStoreEnabled: boolean | undefined =
        useFlags()[
            FeatureFlagKey.ObservabilityAllowAIGeneratedArticlesForMultiStore
        ]

    const shopifyIntegrations = useShopifyIntegrations()
    const hasMultiBrands = shopifyIntegrations.length > 1

    const showLinkToConnectEmailToStore = useMemo(
        () =>
            isAIArticlesForMultiStoreEnabled &&
            hasMultiBrands &&
            !hasEmailToStoreConnection,
        [
            isAIArticlesForMultiStoreEnabled,
            hasMultiBrands,
            hasEmailToStoreConnection,
        ]
    )

    const {fetchedArticles: fetchedArticles, isLoading: isLoading} =
        useConditionalGetAIArticles({
            helpCenterId,
            storeIntegrationId: storeIntegration
                ? Number(storeIntegration?.id)
                : null,
            locale,
        })
    const fetchedArticlesCount = fetchedArticles?.length ?? 0

    const [selectedArticle, setSelectedArticle] =
        useState<AILibraryArticleItem>()

    const latestBatchDate = useMemo(() => {
        const newestArticle = (articles || []).sort(
            (a, b) =>
                new Date(b.batch_datetime || '').getTime() -
                new Date(a.batch_datetime || '').getTime()
        )?.[0]

        return newestArticle?.batch_datetime
    }, [articles])

    const articlesNotReviewed = useMemo(() => {
        return articles?.filter((article) => !article.review_action)
    }, [articles])

    const newArticles = useMemo(
        () =>
            articlesNotReviewed?.filter(
                (article) => article.batch_datetime === latestBatchDate
            ) || [],
        [articlesNotReviewed, latestBatchDate]
    )

    const oldArticles = useMemo(
        () =>
            articlesNotReviewed?.filter(
                (article) => article.batch_datetime !== latestBatchDate
            ) || [],
        [articlesNotReviewed, latestBatchDate]
    )

    const [selectedArticleType, setSelectedArticleType] =
        useState<AIArticleToggleOptionValue>(AIArticleToggleOptionValue.New)

    useEffect(() => {
        setArticles(fetchedArticles || null)
    }, [fetchedArticles])

    useEffect(() => {
        const mappedArticleItems = mapAILibraryArticlesData(
            articlesNotReviewed || [],
            selectedArticleType,
            latestBatchDate
        )
        setMappedArticleItems(mappedArticleItems)
        setSelectedArticle(mappedArticleItems?.[0])
    }, [articlesNotReviewed, selectedArticleType, latestBatchDate])

    return {
        articles: mappedArticleItems,
        isLoading,
        counters: articles && {
            [AIArticleToggleOptionValue.New]: newArticles.length,
            [AIArticleToggleOptionValue.Old]: oldArticles.length,
            [AIArticleToggleOptionValue.All]:
                newArticles.length + oldArticles.length,
        },
        selectedArticleType,
        setSelectedArticleType,
        selectedArticle,
        setSelectedArticle,
        hasNewArticles:
            newArticles.length > 0 &&
            fetchedArticlesCount >= MINIMUM_AI_ARTICLES,
        showLinkToArticleTemplates: fetchedArticlesCount < MINIMUM_AI_ARTICLES,
        hasStoreConnection: !!storeIntegration,
        showLinkToConnectEmailToStore,
        markArticleAsReviewed: (
            templateKey: string,
            reviewAction: ArticleTemplateReviewAction
        ) => {
            if (!articles) return

            const articleIndex = articles.findIndex(
                (item) => item.key === templateKey
            )

            const newArticles = [...articles]
            newArticles[articleIndex] = {
                ...newArticles[articleIndex],
                review_action: reviewAction,
            }

            setArticles(newArticles)
        },
    }
}
