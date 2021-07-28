import {createAction} from '@reduxjs/toolkit'

import {HelpCenterArticle} from '../../../models/helpCenter/types'

import {ArticleActions} from './types'

/**
 * Articles actions
 */

export const saveArticles = createAction<HelpCenterArticle[]>(
    ArticleActions.SAVE_ARTICLES
)

export const updateArticle = createAction<HelpCenterArticle>(
    ArticleActions.UPDATE_ARTICLE
)

export const deleteArticle = createAction<number>(ArticleActions.DELETE_ARTICLE)

export const updateArticlesOrder = createAction<number[]>(
    ArticleActions.UPDATE_ARTICLES_ORDER
)

export const resetArticles = createAction(ArticleActions.RESET_ARTICLES)
