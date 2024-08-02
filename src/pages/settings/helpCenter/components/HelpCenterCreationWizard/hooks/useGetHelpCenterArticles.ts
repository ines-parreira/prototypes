import {useMemo} from 'react'
import {useGetHelpCenterArticleList} from 'models/helpCenter/queries'
import {
    ArticleTemplateType,
    HelpCenterArticleItem,
    LocaleCode,
} from 'models/helpCenter/types'
import {useGetArticleTemplates} from 'pages/settings/helpCenter/queries'
import {DEFAULT_ARTICLE_GROUP} from 'pages/settings/helpCenter/constants'
import {useConditionalGetAIArticles} from 'pages/settings/helpCenter/hooks/useConditionalGetAIArticles'
import useSelfServiceStoreIntegration from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import {IntegrationType} from 'models/integration/constants'
import useShopifyIntegrations from 'pages/automate/common/hooks/useShopifyIntegrations'
import {getValidStoreIntegrationId} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import {
    groupArticlesByCategory,
    mapAIHelpCenterArticleData,
    mapHelpCenterArticleData,
} from '../HelpCenterCreationWizardUtils'
import {MINIMUM_AI_ARTICLES} from '../../CategoriesView/components/ArticleTemplateCard/constants'

export type HelpCenterArticlesOutput = {
    articles: Record<string, HelpCenterArticleItem[]>
    hasAiArticles: boolean
    isLoading: boolean
}
export const useGetHelpCenterArticles = (
    helpCenterId: number,
    locale: LocaleCode,
    helpCenterShopName: string | null
): HelpCenterArticlesOutput => {
    const shopifyIntegrations = useShopifyIntegrations()
    const storeIntegration = useSelfServiceStoreIntegration(
        IntegrationType.Shopify,
        helpCenterShopName ?? ''
    )
    const storeIntegrationId = getValidStoreIntegrationId(
        shopifyIntegrations,
        storeIntegration
    )
    const {fetchedArticles: aiArticles, isLoading: isGetAIArticlesLoading} =
        useConditionalGetAIArticles({
            helpCenterId,
            storeIntegrationId,
            locale,
        })

    const {data: articleTemplates, isLoading: isGetArticleTemplatesLoading} =
        useGetArticleTemplates(locale, {
            refetchOnWindowFocus: false,
        })

    const {
        data: helpCenterArticlesData,
        isLoading: isGetHelpCenterArticleListLoading,
    } = useGetHelpCenterArticleList(
        helpCenterId,
        {
            version_status: 'latest_draft',
        },
        {
            refetchOnWindowFocus: false,
        }
    )
    const helpCenterArticles = helpCenterArticlesData?.data

    const articles = useMemo(() => {
        if (!articleTemplates || !helpCenterArticles) {
            return DEFAULT_ARTICLE_GROUP
        }

        const mappedArticleTemplates = mapHelpCenterArticleData(
            articleTemplates,
            helpCenterArticles,
            locale
        )

        const mappedArticlesAI = mapAIHelpCenterArticleData(
            aiArticles || [],
            helpCenterArticles,
            locale
        )

        const slicedAiArticles = mappedArticlesAI.slice(0, MINIMUM_AI_ARTICLES)

        if (slicedAiArticles.length) {
            return {
                [ArticleTemplateType.AI]: slicedAiArticles,
                [ArticleTemplateType.Template]: mappedArticleTemplates,
            }
        }

        // If no AI articles are available, return template articles grouped by category
        const isAnyArticleSelected = mappedArticleTemplates.some(
            (article) => article.isSelected
        )

        if (mappedArticleTemplates.length && !isAnyArticleSelected) {
            mappedArticleTemplates[0].isSelected = true
        }

        return groupArticlesByCategory(mappedArticleTemplates)
    }, [articleTemplates, helpCenterArticles, aiArticles, locale])

    return {
        articles,
        hasAiArticles: !!articles[ArticleTemplateType.AI]?.length,
        isLoading:
            isGetArticleTemplatesLoading ||
            isGetHelpCenterArticleListLoading ||
            isGetAIArticlesLoading,
    }
}
