import {useMemo} from 'react'
import {
    getArticleUrl,
    getHelpCenterDomain,
    getHomePageItemHashUrl,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import {HELP_CENTER_DEFAULT_LAYOUT} from 'pages/settings/helpCenter/constants'
import {useGetHelpCenterArticleList} from 'models/helpCenter/queries'
import {
    ArticleWithLocalTranslationAndRating,
    HelpCenter,
} from 'models/helpCenter/types'

type AIArticlePublishedPreviewResult = {
    article: ArticleWithLocalTranslationAndRating | undefined
    url: string | undefined
}

export const useAIArticlePublishedPreviewUrl = (
    helpCenter: HelpCenter | undefined,
    articleKey: string
): AIArticlePublishedPreviewResult => {
    if (!helpCenter) {
        throw new Error(`Selected Help center does not exist`)
    }

    const {data: helpCenterArticlesData} = useGetHelpCenterArticleList(
        helpCenter.id,
        {
            version_status: 'latest_draft',
        },
        {
            refetchOnWindowFocus: false,
        }
    )
    const helpCenterArticles = helpCenterArticlesData?.data

    const selectedArticle = useMemo(() => {
        return helpCenterArticles?.find(
            (article) => article.template_key === articleKey
        )
    }, [articleKey, helpCenterArticles])

    const url = useMemo(() => {
        if (!selectedArticle) {
            return undefined
        }

        const domain = getHelpCenterDomain(helpCenter)
        const locale = helpCenter.default_locale
        const slug = selectedArticle.translation.slug
        const articleId = selectedArticle.id
        const unlistedId = selectedArticle.translation.article_unlisted_id
        const isUnlisted =
            selectedArticle.translation.visibility_status === 'UNLISTED'

        return helpCenter.layout === HELP_CENTER_DEFAULT_LAYOUT
            ? getArticleUrl({
                  domain,
                  locale,
                  slug,
                  articleId,
                  unlistedId,
                  isUnlisted,
              })
            : getHomePageItemHashUrl({
                  itemType: 'article',
                  domain,
                  locale,
                  itemId: articleId,
                  isUnlisted,
              })
    }, [helpCenter, selectedArticle])

    return {url, article: selectedArticle}
}
