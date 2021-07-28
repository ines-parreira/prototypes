import {PayloadActionCreator} from '@reduxjs/toolkit'

import {HelpCenterArticle} from '../../../models/helpCenter/types'

export enum ArticleActions {
    SAVE_ARTICLES = 'HELPCENTER/ARTICLES/SAVE_ARTICLES',
    UPDATE_ARTICLE = 'HELPCENTER/ARTICLES/UPDATE_ARTICLE',
    DELETE_ARTICLE = 'HELPCENTER/ARTICLES/DELETE_ARTICLE',
    RESET_ARTICLES = 'HELPCENTER/ARTICLES/RESET_ARTICLES',

    UPDATE_ARTICLES_ORDER = 'HELPCENTER/ARTICLES/UPDATE_ARTICLES_ORDER',
}

export type SaveArticleAction = PayloadActionCreator<
    HelpCenterArticle,
    ArticleActions.SAVE_ARTICLES
>

export type UpdateArticleAction = PayloadActionCreator<
    HelpCenterArticle,
    ArticleActions.UPDATE_ARTICLE
>

export type DeleteArticleAction = PayloadActionCreator<
    HelpCenterArticle,
    ArticleActions.DELETE_ARTICLE
>

export type UpdateArticlesOrder = PayloadActionCreator<
    HelpCenterArticle,
    ArticleActions.UPDATE_ARTICLES_ORDER
>

export type ResetArticlesAction = PayloadActionCreator<
    HelpCenterArticle,
    ArticleActions.RESET_ARTICLES
>

export type ArticlesAction =
    | SaveArticleAction
    | UpdateArticleAction
    | DeleteArticleAction
    | UpdateArticlesOrder
    | ResetArticlesAction

export type HelpCenterArticlesState = {
    articlesById: Record<number, HelpCenterArticle>
}
