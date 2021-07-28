import {createReducer} from '@reduxjs/toolkit'

import {HelpCenterArticlesState} from './types'

import {
    saveArticles,
    updateArticle,
    deleteArticle,
    resetArticles,
    updateArticlesOrder,
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

        // Restores initial state
        .addCase(resetArticles, () => initialState)
)
