import { useMemo } from 'react'

import { VisibilityStatusEnum } from 'models/helpCenter/types'
import {
    getArticleUrl,
    getHelpCenterDomain,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'

import { useArticleContext } from '../context'

export type ArticleDetailsData = {
    article?: {
        id: number
        title: string
        draftVersionId?: number | null
        publishedVersionId?: number | null
        isCurrent?: boolean
    }
    createdDatetime?: Date
    lastUpdatedDatetime?: Date
    articleUrl?: string
    helpCenter?: {
        label: string
        id: number
    }
}

/**
 * Hook to get article details data from ArticleContext.
 * Use this in components that are wrapped by ArticleContextProvider.
 */
export const useArticleDetailsFromContext = (): ArticleDetailsData => {
    const { state, config } = useArticleContext()
    const { helpCenter } = config

    return useMemo(() => {
        const article = state.article
        const locale = state.currentLocale
        const slug =
            state.translationMode === 'new'
                ? undefined
                : article?.translation.slug

        return {
            article: article
                ? {
                      id: article.id,
                      title: article.translation.title,
                      draftVersionId: article.translation.draft_version_id,
                      publishedVersionId:
                          article.translation.published_version_id,
                      isCurrent: article.translation.is_current,
                  }
                : undefined,
            createdDatetime: article?.translation.created_datetime
                ? new Date(article.translation.created_datetime)
                : undefined,
            lastUpdatedDatetime: article?.translation.updated_datetime
                ? new Date(article.translation.updated_datetime)
                : undefined,
            articleUrl:
                article && slug
                    ? getArticleUrl({
                          domain: getHelpCenterDomain(helpCenter),
                          locale: locale,
                          slug: slug,
                          articleId: article.id,
                          unlistedId: article.unlisted_id,
                          isUnlisted:
                              article.translation.visibility_status ===
                              VisibilityStatusEnum.UNLISTED,
                      })
                    : undefined,
            helpCenter: {
                label: helpCenter.name,
                id: helpCenter.id,
            },
        }
    }, [helpCenter, state.article, state.currentLocale, state.translationMode])
}
