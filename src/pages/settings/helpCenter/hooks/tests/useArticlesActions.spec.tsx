import React from 'react'
import {renderHook} from 'react-hooks-testing-library'
import {Provider} from 'react-redux'
import {useParams} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {CreateArticleTranslationDto} from 'models/helpCenter/types'
import {
    deleteArticle,
    pushArticleSupportedLocales,
    removeLocaleFromArticle,
    saveArticles,
    updateArticle,
    updateArticlesOrder,
} from 'state/entities/helpCenter/articles'
import {initialState as articlesState} from 'state/entities/helpCenter/articles/reducer'
import {initialState as categoriesState} from 'state/entities/helpCenter/categories/reducer'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {RootState, StoreDispatch} from 'state/types'
import {
    getArticlesResponseFixture,
    getSingleArticleEnglish,
} from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import {useArticlesActions} from '../useArticlesActions'

const articles = getArticlesResponseFixture.data
const uncategoriedArticle = articles[articles.length - 1]
jest.mock('react-router')
;(useParams as jest.MockedFunction<typeof useParams>).mockReturnValue({
    helpCenterId: '1',
})

const mockCreateArticle = jest.fn().mockImplementation(
    (
        {help_center_id}: {help_center_id: number},
        {
            category_id,
            translation,
        }: {
            category_id: number | null
            translation: CreateArticleTranslationDto
        }
    ) =>
        Promise.resolve({
            data: {
                id: 1,
                category_id,
                help_center_id,
                available_locales: [translation.locale],
                created_datetime: '2021-06-01T09:46:30.044Z',
                updated_datetime: '2021-06-01T09:46:30.044Z',
                deleted_datetime: null,
                translation: {
                    article_id: 1,
                    ...translation,
                    created_datetime: '2021-06-01T09:46:30.044Z',
                    updated_datetime: '2021-06-01T09:46:30.044Z',
                    deleted_datetime: null,
                },
            },
        })
)
const mockUpdateArticle = jest
    .fn()
    .mockImplementation(
        (
            {id, help_center_id}: {id: number; help_center_id: number},
            {category_id}: {category_id: number | null}
        ) =>
            Promise.resolve({
                data: {
                    id,
                    category_id,
                    help_center_id,
                    available_locales: ['fr-FR'],
                    created_datetime: '2021-06-01T09:46:30.044Z',
                    updated_datetime: '2021-06-01T09:46:30.044Z',
                    deleted_datetime: null,
                    translation: {
                        article_id: id,
                        locale: 'fr-FR',
                        title: '',
                        excerpt: '',
                        content: '',
                        slug: '',
                        seo_meta: {
                            title: null,
                            description: null,
                        },
                        created_datetime: '2021-06-01T09:46:30.044Z',
                        updated_datetime: '2021-06-01T09:46:30.044Z',
                        deleted_datetime: null,
                    },
                },
            })
    )
const mockCreateArticleTranslation = jest
    .fn()
    .mockImplementation((_article, translation) => ({
        data: {
            ...translation,
            created_datetime: new Date().toISOString(),
            updated_datetime: new Date().toISOString(),
        },
    }))
const mockUpdateArticleTranslation = jest
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
    })
const mockedListArticles = jest.fn().mockResolvedValue({
    data: {
        data: [uncategoriedArticle],
        object: 'list',
        meta: {
            page: 1,
            per_page: 20,
            current_page:
                '/help-centers/1/articles?has_category=false&page=1&per_page=20',
            item_count: 1,
            nb_pages: 1,
        },
    },
})
const mockedListCategoryArticles = jest.fn()
const mockGetCategoryArticlesPositions = jest
    .fn()
    .mockResolvedValue({data: [1]})
const mockGetUncategorizedArticlesPositions = jest
    .fn()
    .mockResolvedValue({data: [uncategoriedArticle.id]})
const mockListArticleTranslations = jest.fn().mockResolvedValue({
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
})

jest.mock('../useHelpCenterApi', () => {
    return {
        useHelpCenterApi: () => ({
            isReady: true,
            client: {
                listArticles: mockedListArticles,
                listCategoryArticles: mockedListCategoryArticles,
                createArticle: mockCreateArticle,
                updateArticle: mockUpdateArticle,
                updateArticleTranslation: mockUpdateArticleTranslation,
                createArticleTranslation: mockCreateArticleTranslation,
                deleteArticle: () => Promise.resolve(),
                deleteArticleTranslation: () => Promise.resolve(),
                listArticleTranslations: mockListArticleTranslations,
                setArticlesPositionsInCategory: () => Promise.resolve([]),
                setUncategorizedArticlesPositions: () => Promise.resolve([]),
                getCategoryArticlesPositions: mockGetCategoryArticlesPositions,
                getUncategorizedArticlesPositions:
                    mockGetUncategorizedArticlesPositions,
            },
        }),
    }
})

jest.mock('state/entities/helpCenter/articles', () => ({
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

jest.mock('state/ui/helpCenter/selectors', () => ({
    getViewLanguage: () => 'en-US',
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            articles: articlesState,
            categories: categoriesState,
        },
    } as any,
    ui: {helpCenter: uiState} as any,
}

// TODO: This should be extracted in a tests utils folder
const dependencyWrapper: React.ComponentType<any> = ({
    children,
}: {
    children: Element
}) => <Provider store={mockStore(defaultState)}>{children}</Provider>

describe('useArticlesActions()', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('fetchArticles()', () => {
        it('dispatches saveArticles action for uncategorized articles', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.fetchArticles(null, {page: 1, per_page: 20})

            expect(saveArticles).toHaveBeenCalledWith([
                {
                    ...getSingleArticleEnglish,
                    position: 0,
                },
            ])
        })
    })

    describe('getArticleCount()', () => {
        it('returns the article count for uncategorized articles', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            const itemCount = await result.current.getArticleCount(null)

            expect(itemCount).toEqual(1)
        })
    })

    describe('createArticle()', () => {
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
                    seo_meta: {
                        title: null,
                        description: null,
                    },
                },
                null
            )

            expect(saveArticles).toHaveBeenCalled()
        })

        it('dispatches saveArticles action for article in category', async () => {
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
                    seo_meta: {
                        title: null,
                        description: null,
                    },
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

            const {available_locales} = await result.current.updateArticle(
                'fr-FR',
                {
                    id: 1,
                    help_center_id: 1,
                    position: 1,
                    created_datetime: '',
                    updated_datetime: '',
                    available_locales: ['en-US'],
                    translation: {
                        article_id: 1,
                        locale: 'fr-FR',
                        title: '',
                        excerpt: '',
                        content: '',
                        slug: '',
                        seo_meta: {
                            title: null,
                            description: null,
                        },
                        created_datetime: '',
                        updated_datetime: '',
                        rating: {
                            up: 0,
                            down: 0,
                        },
                        sharing_status: 'PUBLIC',
                        is_current: false,
                    },
                    rating: {
                        up: 0,
                        down: 0,
                    },
                },
                null
            )

            expect(updateArticle).toHaveBeenCalled()
            expect(pushArticleSupportedLocales).toHaveBeenCalledWith({
                articleId: 1,
                supportedLocales: ['fr-FR'],
            })
            expect(available_locales).toEqual(['en-US', 'fr-FR'])
        })

        it('does not update translation in list if its locale is not the same from the default help center locale', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            const {available_locales} = await result.current.updateArticle(
                'en-US',
                {
                    id: 1,
                    help_center_id: 1,
                    position: 1,
                    created_datetime: '',
                    updated_datetime: '',
                    available_locales: ['en-US'],
                    translation: {
                        article_id: 1,
                        locale: 'fr-FR',
                        title: '',
                        excerpt: '',
                        content: '',
                        slug: '',
                        seo_meta: {
                            title: null,
                            description: null,
                        },
                        created_datetime: '',
                        updated_datetime: '',
                        rating: {
                            up: 0,
                            down: 0,
                        },
                        sharing_status: 'PUBLIC',
                        is_current: false,
                    },
                    rating: {
                        up: 0,
                        down: 0,
                    },
                },
                null
            )

            expect(updateArticle).toHaveBeenCalledTimes(0)
            expect(pushArticleSupportedLocales).toHaveBeenCalledWith({
                articleId: 1,
                supportedLocales: ['fr-FR'],
            })
            expect(available_locales).toEqual(['en-US', 'fr-FR'])
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

            await result.current.updateArticlesPositions(
                [getSingleArticleEnglish],
                null
            )

            expect(updateArticlesOrder).toHaveBeenCalled()
        })
    })

    describe('deleteArticleTranslation()', () => {
        it('dispatches the removeLocaleFromArticle action', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.deleteArticleTranslation(1, 'en-US')

            expect(removeLocaleFromArticle).toHaveBeenCalled()
        })
    })

    describe('cloneArticle()', () => {
        it('calls listArticleTranslations to get all the translations', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.cloneArticle(getSingleArticleEnglish)

            expect(mockListArticleTranslations).toHaveBeenCalled()
        })

        it('calls createArticle to create the article', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.cloneArticle(getSingleArticleEnglish)

            expect(mockCreateArticle).toHaveBeenCalled()
        })

        it('calls createArticleTranslation to append all the translations', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.cloneArticle(getSingleArticleEnglish)

            expect(mockCreateArticleTranslation).toHaveBeenCalledTimes(1)
        })
    })
})
