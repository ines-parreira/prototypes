import _keyBy from 'lodash/keyBy'
import produce from 'immer'

import {createArticleFromDto} from '../../../../models/helpCenter/utils'

import {
    getArticlesResponseFixture,
    getSingleArticleEnglish as singleArticle,
} from '../../../../pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'

import reducer, {initialState} from '../reducer'

import {
    saveArticles,
    updateArticle,
    deleteArticle,
    resetArticles,
    pushArticleSupportedLocales,
    removeLocaleFromArticle,
} from '../actions'

import {ArticlesAction} from '../types'

const articlesResponse =
    getArticlesResponseFixture.data.map(createArticleFromDto)

describe('Help Center/Articles reducer', () => {
    it('has the correct initial state', () => {
        expect(reducer(undefined, {} as ArticlesAction)).toEqual({
            articlesById: {},
        })
    })

    describe('dispatch saveArticles', () => {
        it('saves the articles by key', () => {
            const nextState = reducer(undefined, saveArticles(articlesResponse))
            const articlesId = Object.keys(nextState.articlesById).map((id) =>
                parseInt(id, 10)
            )

            // We have the same number of entities
            expect(articlesId.length).toEqual(articlesResponse.length)

            // We have the same keys
            expect(
                articlesId.every((id) => {
                    return !!articlesResponse.find(
                        (article) => article.id === id
                    )
                })
            ).toBeTruthy()
        })
    })

    describe('dispatch updateArticle', () => {
        it('updates the current article', () => {
            const updatedArticle = produce(singleArticle, (draft) => {
                if (draft.translation) {
                    draft.translation.title = 'New Title'
                }
            })

            const nextState = reducer(
                {
                    articlesById: {
                        [singleArticle.id]: singleArticle,
                    },
                },
                updateArticle(updatedArticle)
            )

            expect(nextState).toEqual({
                articlesById: {
                    [singleArticle.id]: updatedArticle,
                },
            })
        })
    })

    describe('dispatch deleteArticle', () => {
        it('removes the current article', () => {
            const nextState = reducer(
                {
                    articlesById: {
                        [singleArticle.id]: singleArticle,
                    },
                },
                deleteArticle(singleArticle.id)
            )

            expect(nextState).toEqual({
                articlesById: {},
            })
        })
    })

    describe('dispatch pushArticleSupportedLocales', () => {
        const nextState = reducer(
            {
                articlesById: {
                    [singleArticle.id]: singleArticle,
                },
            },
            pushArticleSupportedLocales({
                articleId: 1,
                supportedLocales: ['fr-FR'],
            })
        )

        expect(nextState).toEqual({
            articlesById: {
                1: {
                    ...singleArticle,
                    available_locales: ['en-US', 'fr-FR'],
                },
            },
        })
    })

    describe('dispatch removeLocaleFromArticle', () => {
        it('removes the given locale from `available_locales`', () => {
            const nextState = reducer(
                {
                    articlesById: {
                        [singleArticle.id]: {
                            ...singleArticle,
                            available_locales: ['en-US', 'fr-FR', 'de-DE'],
                        },
                    },
                },
                removeLocaleFromArticle({articleId: 1, locale: 'de-DE'})
            )

            expect(nextState).toEqual({
                articlesById: {
                    1: {
                        ...singleArticle,
                        available_locales: ['en-US', 'fr-FR'],
                    },
                },
            })
        })
    })

    describe('dispatch resetArticles', () => {
        it('restores the initial state', () => {
            const nextState = reducer(
                {
                    articlesById: _keyBy(articlesResponse, 'id'),
                },
                resetArticles()
            )

            expect(nextState).toEqual(initialState)
        })
    })
})
