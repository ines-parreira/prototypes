import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {useParams} from 'react-router-dom'

import {renderHook} from 'react-hooks-testing-library'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from '../../../../../state/types'
import {
    deleteArticle,
    saveArticles,
    updateArticle,
    updateArticlesOrder,
} from '../../../../../state/helpCenter/articles'

import {useArticlesActions} from '../useArticlesActions'

jest.mock('react-router')
;(useParams as jest.MockedFunction<typeof useParams>).mockReturnValue({
    helpcenterId: '1',
})

jest.mock('../useHelpcenterApi', () => {
    return {
        useHelpcenterApi: jest.fn().mockReturnValue({
            isReady: true,
            client: {
                createArticle: () =>
                    Promise.resolve({
                        data: {
                            translation: {},
                        },
                    }),
                updateArticleTranslation: () =>
                    Promise.resolve({
                        data: {},
                    }),
                deleteArticle: () => Promise.resolve(),
                listArticleTranslations: () =>
                    Promise.resolve({
                        data: {},
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
    updateArticlesOrder: jest.fn().mockReturnValue({
        type: 'HELPCENTER/ARTICLES/UPDATE_ARTICLES_ORDER',
        payload: {},
    }),
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    helpCenter: {
        articles: {
            articlesById: {},
        },
        categories: {
            categoriesById: {},
        },
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
        it('dispatches saveArticles action', async () => {
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
    })

    describe('createArticleInCategory()', () => {
        it('dispatches saveArticles action', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.createArticleInCategory(
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

    describe('updateArticleTranslation()', () => {
        it('dispatches updateArticle action', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.updateArticleTranslation({
                id: 1,
                help_center_id: 1,
                position: 1,
                created_datetime: '',
                updated_datetime: '',
                translation: {
                    locale: 'en-US',
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

    describe('updateArticlePositionInCategory()', () => {
        it('dispatches updateArticlesOrder action', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.updateArticlePositionInCategory(
                [
                    {
                        id: 1,
                        help_center_id: 1,
                        position: 1,
                        created_datetime: '',
                        updated_datetime: '',
                        translation: {
                            locale: 'en-US',
                            title: '',
                            excerpt: '',
                            content: '',
                            slug: '',
                            created_datetime: '',
                            updated_datetime: '',
                            article_id: 1,
                        },
                    },
                ],
                1
            )

            expect(updateArticlesOrder).toHaveBeenCalled()
        })
    })

    describe('updateUncategorizedArticlePosition()', () => {
        it('dispatches updateArticlesOrder action', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.updateUncategorizedArticlePosition([
                {
                    id: 1,
                    help_center_id: 1,
                    position: 1,
                    created_datetime: '',
                    updated_datetime: '',
                    translation: {
                        locale: 'en-US',
                        title: '',
                        excerpt: '',
                        content: '',
                        slug: '',
                        created_datetime: '',
                        updated_datetime: '',
                        article_id: 1,
                    },
                },
            ])

            expect(updateArticlesOrder).toHaveBeenCalled()
        })
    })
})
