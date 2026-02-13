import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { useGetHelpCenterArticleList } from 'models/helpCenter/queries'
import type { HelpCenterArticleItem, LocaleCode } from 'models/helpCenter/types'
import { ArticleTemplateType } from 'models/helpCenter/types'
import { DEFAULT_ARTICLE_GROUP } from 'pages/settings/helpCenter/constants'
import { useGetAIArticles } from 'pages/settings/helpCenter/hooks/useGetAIArticles'
import { useGetArticleTemplates } from 'pages/settings/helpCenter/queries'
import { getValidStoreIntegrationId } from 'pages/settings/helpCenter/utils/helpCenter.utils'
import { getStoreIntegrations } from 'state/integrations/selectors'

import { MAXIMUM_AI_ARTICLES } from '../../CategoriesView/components/ArticleTemplateCard/constants'
import {
    groupArticlesByCategory,
    mapAIHelpCenterArticleData,
    mapHelpCenterArticleData,
} from '../HelpCenterCreationWizardUtils'

export type HelpCenterArticlesOutput = {
    articles: Record<string, HelpCenterArticleItem[]>
    hasAiArticles: boolean
    isLoading: boolean
}
export const useGetHelpCenterArticles = (
    helpCenterId: number,
    locale: LocaleCode,
    helpCenterShopName: string | null,
): HelpCenterArticlesOutput => {
    const allStoreIntegrations = useAppSelector(getStoreIntegrations)
    const storeIntegrationId = getValidStoreIntegrationId(
        allStoreIntegrations,
        helpCenterShopName,
    )
    const { fetchedArticles: aiArticles, isLoading: isGetAIArticlesLoading } =
        useGetAIArticles({
            helpCenterId,
            storeIntegrationId,
            locale,
        })

    const { data: articleTemplates, isLoading: isGetArticleTemplatesLoading } =
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
        },
    )
    const helpCenterArticles = helpCenterArticlesData?.data

    const articles = useMemo(() => {
        if (!articleTemplates || !helpCenterArticles) {
            return DEFAULT_ARTICLE_GROUP
        }

        const mappedArticleTemplates = mapHelpCenterArticleData(
            articleTemplates,
            helpCenterArticles,
            locale,
        )

        const mappedArticlesAI = mapAIHelpCenterArticleData(
            aiArticles || [],
            helpCenterArticles,
            locale,
        )

        const limitedArticlesAI = mappedArticlesAI.slice(0, MAXIMUM_AI_ARTICLES)

        if (limitedArticlesAI.length) {
            return {
                [ArticleTemplateType.AI]: limitedArticlesAI,
                [ArticleTemplateType.Template]: mappedArticleTemplates,
            }
        }

        // If no AI articles are available, return template articles grouped by category
        const isAnyArticleSelected = mappedArticleTemplates.some(
            (article) => article.isSelected,
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
