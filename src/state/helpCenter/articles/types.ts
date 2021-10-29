import {PayloadActionCreator} from '@reduxjs/toolkit'

import {Article, LocaleCode} from '../../../models/helpCenter/types'

export enum ArticleActions {
    SAVE_ARTICLES = 'HELPCENTER/ARTICLES/SAVE_ARTICLES',
    UPDATE_ARTICLE = 'HELPCENTER/ARTICLES/UPDATE_ARTICLE',
    DELETE_ARTICLE = 'HELPCENTER/ARTICLES/DELETE_ARTICLE',
    RESET_ARTICLES = 'HELPCENTER/ARTICLES/RESET_ARTICLES',

    PUSH_ARTICLE_LOCALES = 'HELPCENTER/ARTICLES/PUSH_ARTICLE_LOCALES',
    REMOVE_ARTICLE_LOCALE = 'HELPCENTER/ARTICLES/REMOVE_ARTICLE_LOCALE',
    UPDATE_ARTICLES_ORDER = 'HELPCENTER/ARTICLES/UPDATE_ARTICLES_ORDER',
}

export type SaveArticleAction = PayloadActionCreator<
    Article,
    ArticleActions.SAVE_ARTICLES
>

export type UpdateArticleAction = PayloadActionCreator<
    Article,
    ArticleActions.UPDATE_ARTICLE
>

export type DeleteArticleAction = PayloadActionCreator<
    Article,
    ArticleActions.DELETE_ARTICLE
>

export type RemoveArticleSupportedLocales = PayloadActionCreator<
    {
        articleId: number
        locale: LocaleCode
    },
    ArticleActions.REMOVE_ARTICLE_LOCALE
>

export type UpdateArticlesOrder = PayloadActionCreator<
    Article,
    ArticleActions.UPDATE_ARTICLES_ORDER
>

export type PushArticleSupportedLocales = PayloadActionCreator<
    {
        articleId: number
        supportedLocales: LocaleCode[]
    },
    ArticleActions.PUSH_ARTICLE_LOCALES
>

export type ResetArticlesAction = PayloadActionCreator<
    Article,
    ArticleActions.RESET_ARTICLES
>

export type ArticlesAction =
    | SaveArticleAction
    | UpdateArticleAction
    | DeleteArticleAction
    | UpdateArticlesOrder
    | ResetArticlesAction
    | PushArticleSupportedLocales
    | RemoveArticleSupportedLocales

export type HelpCenterArticlesState = {
    articlesById: Record<number, Article>
}
