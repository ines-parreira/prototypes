import {createAction} from '@reduxjs/toolkit'

import {Article, LocaleCode} from '../../../models/helpCenter/types'

import {ArticleActions} from './types'

/**
 * Articles actions
 */

export const saveArticles = createAction<Article[]>(
    ArticleActions.SAVE_ARTICLES
)

export const updateArticle = createAction<Article>(
    ArticleActions.UPDATE_ARTICLE
)

export const deleteArticle = createAction<number>(ArticleActions.DELETE_ARTICLE)

export const updateArticlesOrder = createAction<number[]>(
    ArticleActions.UPDATE_ARTICLES_ORDER
)

export const pushArticleSupportedLocales = createAction<{
    articleId: number
    supportedLocales: LocaleCode[]
}>(ArticleActions.PUSH_ARTICLE_LOCALES)

export const removeLocaleFromArticle = createAction<{
    articleId: number
    locale: LocaleCode
}>(ArticleActions.REMOVE_ARTICLE_LOCALE)

export const resetArticles = createAction(ArticleActions.RESET_ARTICLES)
