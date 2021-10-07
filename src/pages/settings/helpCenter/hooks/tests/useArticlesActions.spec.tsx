import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {useParams} from 'react-router-dom'

import {renderHook} from 'react-hooks-testing-library'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from '../../../../../state/types'
import {initialState as articlesState} from '../../../../../state/helpCenter/articles/reducer'
import {initialState as uiState} from '../../../../../state/helpCenter/ui/reducer'
import {initialState as categoriesState} from '../../../../../state/helpCenter/categories/reducer'
import {
    deleteArticle,
    pushArticleSupportedLocales,
    removeLocaleFromArticle,
    saveArticles,
    updateArticle,
    updateArticlesOrder,
} from '../../../../../state/helpCenter/articles'

import {getSingleArticleEnglish} from '../../fixtures/getArticlesResponse.fixture'

import {useArticlesActions} from '../useArticlesActions'
import {useHelpcenterApi} from '../useHelpcenterApi'

jest.mock('react-router')
;(useParams as jest.MockedFunction<typeof useParams>).mockReturnValue({
    helpcenterId: '1',
})

jest.mock('../useHelpcenterApi', () => {
    return {
        useHelpcenterApi: jest.fn().mockReturnValue({
            isReady: true,
            client: {
                createArticle: jest.fn().mockResolvedValue({
                    data: {
                        translation: {},
                    },
                }),
                updateArticle: jest.fn().mockResolvedValue({
                    data: {
                        translation: {},
                    },
                }),
                updateArticleTranslation: jest
                    .fn()
                    .mockResolvedValueOnce({
                        data: {
                            locale: 'fr-FR',
                            title: '',
                            excerpt: '',
                            description: '',
                            slug: '',
                        },
                    })
                    .mockResolvedValue({
                        data: {
                            locale: 'en-US',
                            title: '',
                            excerpt: '',
                            description: '',
                            slug: '',
                        },
                    }),
                createArticleTranslation: jest.fn().mockResolvedValue({
                    data: {},
                }),
                deleteArticle: () => Promise.resolve(),
                deleteArticleTranslation: () => Promise.resolve(),
                listArticleTranslations: jest.fn().mockResolvedValue({
                    data: {
                        data: [
                            {
                                locale: 'en-US',
                                title: '',
                                excerpt: '',
                                content: '',
                                slug: '',
                            },
                            {
                                locale: 'fr-FR',
                                title: '',
                                excerpt: '',
                                content: '',
                                slug: '',
                            },
                        ],
                    },
                }),
                setArticlesPositionsInCategory: () => Promise.resolve([]),
                setUncategorizedArticlesPositions: () => Promise.resolve([]),
                getCategoryArticlesPositions: () => Promise.resolve({data: []}),
                getUncategorizedArticlesPositions: () =>
                    Promise.resolve({data: []}),
            },
        }),
    }
})

jest.mock('../../../../../state/helpCenter/articles', () => ({
    deleteArticle: jest.fn().mockReturnValue({
        type: 'HELPCENTER/ARTICLES/DELETE_ARTICLE',
        payload: {},
    }),
    saveArticles: jest.fn().mockReturnValue({
        type: 'HELPCENTER/ARTICLES/SAVE_ARTICLES',
        payload: {},
    }),
    updateArticle: jest.fn().mockReturnValue({
        type: 'HELPCENTER/ARTICLES/UPDATE_ARTICLE',
        payload: {},
    }),
    pushArticleSupportedLocales: jest.fn().mockReturnValue({
        type: 'HELPCENTER/ARTICLES/UPDATE_ARTICLE',
        payload: {},
    }),
    updateArticlesOrder: jest.fn().mockReturnValue({
        type: 'HELPCENTER/ARTICLES/UPDATE_ARTICLES_ORDER',
        payload: {},
    }),
    removeLocaleFromArticle: jest.fn().mockReturnValue({
        type: 'HELPCENTER/ARTICLES/REMOVE_ARTICLE_LOCALE',
        payload: {},
    }),
}))

jest.mock('../../../../../state/helpCenter/ui/selectors', () => ({
    getViewLanguage: () => 'en-US',
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    helpCenter: {
        ui: uiState,
        articles: articlesState,
        categories: categoriesState,
    },
}

// TODO: This should be extracted in a tests utils folder
const dependencyWrapper: React.ComponentType<any> = ({
    children,
}: {
    children: Element
}) => <Provider store={mockStore(defaultState)}>{children}</Provider>

describe('useArticlesActions', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('createArticle()', () => {
        it('dispatches saveArticles action for article in category', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.createArticle({
                locale: 'en-US',
                title: '',
                excerpt: '',
                content: '',
                slug: '',
            })

            expect(saveArticles).toHaveBeenCalled()
        })

        it('dispatches saveArticles action for uncategorized article', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.createArticle(
                {
                    locale: 'en-US',
                    title: '',
                    excerpt: '',
                    content: '',
                    slug: '',
                },
                1
            )

            expect(saveArticles).toHaveBeenCalled()
        })
    })

    describe('updateArticle()', () => {
        it('dispatches saveArticles and pushArticleSupportedLocales actions for article in category', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.updateArticle({
                id: 1,
                help_center_id: 1,
                position: 1,
                created_datetime: '',
                updated_datetime: '',
                available_locales: ['en-US'],
                translation: {
                    locale: 'fr-FR',
                    title: '',
                    excerpt: '',
                    content: '',
                    slug: '',
                    created_datetime: '',
                    updated_datetime: '',
                    article_id: 1,
                },
            })

            expect(updateArticle).toHaveBeenCalled()
            expect(pushArticleSupportedLocales).toHaveBeenCalledWith({
                articleId: 1,
                supportedLocales: ['fr-FR'],
            })
        })
    })

    describe('deleteArticle()', () => {
        it('dispatches deleteArticle action', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.deleteArticle(1)

            expect(deleteArticle).toHaveBeenCalled()
        })
    })

    describe('updateArticlesPositions()', () => {
        it('dispatches updateArticlesOrder action for article in category', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.updateArticlesPositions(
                [getSingleArticleEnglish],
                1
            )

            expect(updateArticlesOrder).toHaveBeenCalled()
        })

        it('dispatches updateArticlesOrder action for uncategorized article', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.updateArticlesPositions([
                getSingleArticleEnglish,
            ])

            expect(updateArticlesOrder).toHaveBeenCalled()
        })
    })

    describe('deleteArticleTranslation()', () => {
        it('dispatches the removeLocaleFromArticle', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.deleteArticleTranslation(1, 'en-US')

            expect(removeLocaleFromArticle).toHaveBeenCalled()
        })

        it('dispatches the deleteArticle action if locale param is equal to view language', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.deleteArticleTranslation(1, 'en-US')

            expect(deleteArticle).toHaveBeenCalled()
        })
    })

    describe('cloneArticle()', () => {
        it('calls listArticleTranslations to get all the translations', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.cloneArticle(getSingleArticleEnglish)

            expect(
                useHelpcenterApi().client?.listArticleTranslations
            ).toHaveBeenCalled()
        })

        it('calls createArticle to create the article', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.cloneArticle(getSingleArticleEnglish)

            expect(useHelpcenterApi().client?.createArticle).toHaveBeenCalled()
        })

        it('calls createArticleTranslation to append all the translations', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.cloneArticle(getSingleArticleEnglish)

            expect(
                useHelpcenterApi().client?.createArticleTranslation
            ).toHaveBeenCalledTimes(1)
        })
    })
})
