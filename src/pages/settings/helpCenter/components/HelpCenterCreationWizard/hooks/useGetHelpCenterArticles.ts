import {useMemo} from 'react'
import {useGetHelpCenterArticleList} from 'models/helpCenter/queries'
import {
    ArticleTemplateCategory,
    HelpCenterArticleItem,
    LocaleCode,
} from 'models/helpCenter/types'
import {useGetArticleTemplates} from 'pages/settings/helpCenter/queries'
import {DEFAULT_ARTICLE_GROUP} from 'pages/settings/helpCenter/constants'
import {
    groupArticlesByCategory,
    mapHelpCenterArticleData,
} from '../HelpCenterCreationWizardUtils'

export type HelpCenterArticlesOutput = {
    articles: Record<ArticleTemplateCategory, HelpCenterArticleItem[]>
    isLoading: boolean
}
export const useGetHelpCenterArticles = (
    helpCenterId: number,
    locale: LocaleCode
): HelpCenterArticlesOutput => {
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

        const mappedArticles = mapHelpCenterArticleData(
            articleTemplates,
            helpCenterArticles,
            locale
        )

        const isAnyArticleSelected = mappedArticles.some(
            (article) => article.isSelected
        )

        if (mappedArticles.length && !isAnyArticleSelected) {
            mappedArticles[0].isSelected = true
        }

        return groupArticlesByCategory(mappedArticles)
    }, [articleTemplates, helpCenterArticles, locale])

    return {
        articles,
        isLoading:
            isGetArticleTemplatesLoading || isGetHelpCenterArticleListLoading,
    }
}
