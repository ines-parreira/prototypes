import {createReducer} from '@reduxjs/toolkit'
import _uniq from 'lodash/uniq'

import {HelpCenterArticlesState} from './types'

import {
    saveArticles,
    updateArticle,
    deleteArticle,
    resetArticles,
    updateArticlesOrder,
    pushArticleSupportedLocales,
    removeLocaleFromArticle,
} from './actions'

export const initialState: HelpCenterArticlesState = {
    articlesById: {},
}

export default createReducer<HelpCenterArticlesState>(initialState, (builder) =>
    builder
        // Append the payload to current state
        .addCase(saveArticles, (state, {payload}) => {
            state.articlesById = payload.reduce(
                (acc, article) => ({
                    ...acc,
                    [article.id]: article,
                }),
                state.articlesById
            )
        })

        // Merge payload with the current article
        .addCase(updateArticle, (state, {payload}) => {
            state.articlesById[payload.id] = payload
        })

        //   Delete article by id and remove the translations
        // associated with it
        .addCase(deleteArticle, (state, {payload}) => {
            delete state.articlesById[payload]
        })

        .addCase(updateArticlesOrder, (state, {payload}) => {
            payload.forEach((articleId, position) => {
                if (state.articlesById[articleId]) {
                    state.articlesById[articleId].position = position
                }
            })
        })

        .addCase(pushArticleSupportedLocales, (state, {payload}) => {
            if (state.articlesById[payload.articleId]) {
                state.articlesById[payload.articleId].available_locales = _uniq(
                    [
                        ...state.articlesById[payload.articleId]
                            .available_locales,
                        ...payload.supportedLocales,
                    ]
                )
            }
        })

        .addCase(removeLocaleFromArticle, (state, {payload}) => {
            const {articleId, locale} = payload
            if (state.articlesById[articleId]) {
                const indexOf = state.articlesById[
                    articleId
                ].available_locales.findIndex((lang) => lang === locale)

                if (indexOf >= 0) {
                    state.articlesById[articleId].available_locales.splice(
                        indexOf,
                        1
                    )
                }
            }
        })

        // Restores initial state
        .addCase(resetArticles, () => initialState)
)
