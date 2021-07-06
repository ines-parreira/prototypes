import {createAction} from '@reduxjs/toolkit'

import {HelpCenterArticle} from '../../../models/helpCenter/types'

import {
    HELPCENTER_ARTICLES_FETCHED,
    HELPCENTER_ARTICLE_CREATED,
    HELPCENTER_ARTICLE_DELETED,
    HELPCENTER_ARTICLE_FETCHED,
    HELPCENTER_ARTICLE_UPDATED,
} from './constants'

export const helpCenterArticleCreated = createAction<HelpCenterArticle>(
    HELPCENTER_ARTICLE_CREATED
)

export const helpCenterArticleDeleted = createAction<number>(
    HELPCENTER_ARTICLE_DELETED
)

export const helpCenterArticleFetched = createAction<HelpCenterArticle>(
    HELPCENTER_ARTICLE_FETCHED
)

export const helpCenterArticleUpdated = createAction<HelpCenterArticle>(
    HELPCENTER_ARTICLE_UPDATED
)

export const helpCenterArticlesFetched = createAction<HelpCenterArticle[]>(
    HELPCENTER_ARTICLES_FETCHED
)
