import {AnyAction} from 'redux'
import {createAction, ThunkAction} from '@reduxjs/toolkit'

import {Article, LocaleCode} from 'models/helpCenter/types'
import {createArticleFromDto} from 'models/helpCenter/utils'
import {getHelpCenterClient} from 'rest_api/help_center_api'
import {StoreDispatch, StoreState} from 'state/types'

import {ArticleActions} from './types'
import * as articleSelectors from './selectors'

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

export const cleanArticlesWithNoTranslation = createAction<{
    categoryId: number
    localeDeleted: LocaleCode
}>(ArticleActions.CLEAN_ARTICLES_WITH_NO_TRANSLATION)

export function reloadArticles(
    helpCenterId: number
): ThunkAction<
    Promise<ReturnType<StoreDispatch>>,
    StoreState,
    unknown,
    AnyAction
> {
    return async (dispatch, getState) => {
        const client = await getHelpCenterClient()
        const ids = articleSelectors.getArticles(getState()).map((a) => a.id)
        const {
            data: {data: articles},
        } = await client.listArticles({
            help_center_id: helpCenterId,
            order_by: 'position',
            version_status: 'latest_draft',
            ids,
            per_page: ids.length,
            page: 1,
        })
        const payload = articles.map((article, index) =>
            createArticleFromDto(article, index)
        )
        return dispatch(saveArticles(payload))
    }
}
