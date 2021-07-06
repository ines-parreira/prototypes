import {createReducer} from '@reduxjs/toolkit'

import {HelpCenterArticlesState} from './types'
import {
    helpCenterArticleCreated,
    helpCenterArticleDeleted,
    helpCenterArticleFetched,
    helpCenterArticleUpdated,
    helpCenterArticlesFetched,
} from './actions'

const initialState: HelpCenterArticlesState = {}

const helpCenterArticlesReducer = createReducer<HelpCenterArticlesState>(
    initialState,
    (builder) =>
        builder
            .addCase(helpCenterArticleCreated, (state, {payload}) => {
                state[payload.id.toString()] = payload
            })
            .addCase(helpCenterArticleFetched, (state, {payload}) => {
                state[payload.id.toString()] = payload
            })
            .addCase(helpCenterArticleUpdated, (state, {payload}) => {
                state[payload.id.toString()] = payload
            })
            .addCase(helpCenterArticleDeleted, (state, {payload}) => {
                delete state[payload.toString()]
            })
            .addCase(helpCenterArticlesFetched, (state, {payload}) => {
                return payload.reduce(
                    (
                        acc: HelpCenterArticlesState,
                        currentHelpCenterArticle
                    ) => {
                        acc[
                            currentHelpCenterArticle.id
                        ] = currentHelpCenterArticle

                        return acc
                    },
                    {}
                )
            })
)

export default helpCenterArticlesReducer
