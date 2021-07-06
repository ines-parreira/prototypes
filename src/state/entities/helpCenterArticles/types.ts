import {PayloadActionCreator} from '@reduxjs/toolkit'

import {HelpCenterArticle} from '../../../models/helpCenter/types'

import {
    HELPCENTER_ARTICLES_FETCHED,
    HELPCENTER_ARTICLE_CREATED,
    HELPCENTER_ARTICLE_DELETED,
    HELPCENTER_ARTICLE_FETCHED,
    HELPCENTER_ARTICLE_UPDATED,
} from './constants'

export type HelpCenterArticlesState = {[key: string]: HelpCenterArticle}

export type HelpCenterArticlesAction =
    | HelpCenterArticleCreatedAction
    | HelpCenterArticleDeletedAction
    | HelpCenterArticleFetchedAction
    | HelpCenterArticleUpdatedAction
    | HelpCenterArticlesFetchedAction

export type HelpCenterArticleCreatedAction = PayloadActionCreator<
    HelpCenterArticle,
    typeof HELPCENTER_ARTICLE_CREATED
>

export type HelpCenterArticleDeletedAction = PayloadActionCreator<
    string,
    typeof HELPCENTER_ARTICLE_DELETED
>

export type HelpCenterArticleFetchedAction = PayloadActionCreator<
    HelpCenterArticle,
    typeof HELPCENTER_ARTICLE_FETCHED
>

export type HelpCenterArticleUpdatedAction = PayloadActionCreator<
    HelpCenterArticle,
    typeof HELPCENTER_ARTICLE_UPDATED
>

export type HelpCenterArticlesFetchedAction = PayloadActionCreator<
    HelpCenterArticle[],
    typeof HELPCENTER_ARTICLES_FETCHED
>
