import { useMemo } from 'react'

import type {
    HelpCenter,
    LocaleCode,
    VisibilityStatus,
} from 'models/helpCenter/types'
import {
    getArticleUrl,
    getHelpCenterDomain,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'

import type { Props as HelpCenterArticleDetailsProps } from '../../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelHelpCenterArticle/KnowledgeEditorSidePanelSectionHelpCenterArticleDetails'

type Props = {
    article?: {
        visibilityStatus: VisibilityStatus
        createdDatetime: string
        lastUpdatedDatetime: string
        slug?: string
        articleId: number
        unlistedId: string
    }
    locale: LocaleCode
    helpCenter: HelpCenter
}

export const useKnowledgeEditorHelpCenterArticleDetails = ({
    article,
    locale,
    helpCenter,
}: Props): Omit<HelpCenterArticleDetailsProps, 'sectionId'> => {
    return useMemo(
        () => ({
            isPublished: article
                ? article.visibilityStatus === 'PUBLIC'
                : undefined,
            createdDatetime: article
                ? new Date(article.createdDatetime)
                : undefined,
            lastUpdatedDatetime: article
                ? new Date(article.lastUpdatedDatetime)
                : undefined,
            articleUrl:
                article && article.slug
                    ? getArticleUrl({
                          domain: getHelpCenterDomain(helpCenter),
                          locale: locale,
                          slug: article.slug,
                          articleId: article.articleId,
                          unlistedId: article.unlistedId,
                          isUnlisted: article.visibilityStatus === 'UNLISTED',
                      })
                    : undefined,
        }),
        [helpCenter, article, locale],
    )
}
