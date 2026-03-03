import type React from 'react'

import { renderHook } from '@repo/testing'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { CreateArticleTranslationDto } from 'models/helpCenter/types'
import {
    getArticlesResponseFixture,
    getSingleArticleEnglish,
} from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import {
    deleteArticle,
    pushArticleSupportedLocales,
    removeLocaleFromArticle,
    saveArticles,
    updateArticle,
    updateArticlesOrder,
} from 'state/entities/helpCenter/articles'
import { initialState as articlesState } from 'state/entities/helpCenter/articles/reducer'
import { initialState as categoriesState } from 'state/entities/helpCenter/categories/reducer'
import type { RootState, StoreDispatch } from 'state/types'
import { initialState as uiState } from 'state/ui/helpCenter/reducer'

import { useArticlesActions } from '../useArticlesActions'

const articles = getArticlesResponseFixture.data
const uncategoriedArticle = articles[articles.length - 1]

jest.mock('../useCurrentHelpCenter', () => ({
    __esModule: true,
    default: jest.fn().mockReturnValue({
        id: 1,
    }),
}))

const mockInvalidateQueries = jest.fn()

jest.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({
        invalidateQueries: mockInvalidateQueries,
    }),
}))

const mockCreateArticle = jest.fn().mockImplementation(
    (
        { help_center_id }: { help_center_id: number },
        {
            category_id,
            translation,
        }: {
            category_id: number | null
            translation: CreateArticleTranslationDto
        },
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
        }),
)
const mockUpdateArticle = jest
    .fn()
    .mockImplementation(
        (
            { id, help_center_id }: { id: number; help_center_id: number },
            { category_id }: { category_id: number | null },
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
            }),
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
    .mockResolvedValue({ data: [1] })
const mockGetUncategorizedArticlesPositions = jest
    .fn()
    .mockResolvedValue({ data: [uncategoriedArticle.id] })
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

const mockFetchCategoryArticleCount = jest.fn()
jest.mock('../useCategoriesActions', () => {
    return {
        useCategoriesActions: () => ({
            fetchCategoryArticleCount: mockFetchCategoryArticleCount,
        }),
    }
})

jest.mock('state/entities/helpCenter/articles', () => {
    const mockGetSingleArticleEnglish = jest
        .fn()
        .mockResolvedValue(getSingleArticleEnglish)
    return {
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
        getArticlesById: jest.fn().mockReturnValue({
            '1': { ...mockGetSingleArticleEnglish, category_id: 1 },
        }),
    }
})

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
    ui: { helpCenter: uiState } as any,
}
const queryKey = ['help-center', 1, 'articles']

// TODO: This should be extracted in a tests utils folder
const dependencyWrapper: React.ComponentType<any> = ({
    children,
}: {
    children: React.ReactNode
}) => <Provider store={mockStore(defaultState)}>{children}</Provider>

describe('useArticlesActions()', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('fetchArticles()', () => {
        it('dispatches saveArticles action for uncategorized articles', async () => {
            const { result } = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.fetchArticles(null, { page: 1, per_page: 20 })

            expect(saveArticles).toHaveBeenCalledWith([
                {
                    ...getSingleArticleEnglish,
                    position: 0,
                },
            ])
        })
    })

    describe('createArticle()', () => {
        it('dispatches saveArticles action for uncategorized article', async () => {
            const { result } = renderHook(useArticlesActions, {
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
                    category_id: null,
                    visibility_status: 'PUBLIC',
                },
                null,
            )

            expect(mockFetchCategoryArticleCount).toHaveBeenCalled()
            expect(saveArticles).toHaveBeenCalled()
            expect(mockInvalidateQueries).toHaveBeenCalledWith({
                queryKey,
            })
        })

        it('dispatches saveArticles action for article in category', async () => {
            const { result } = renderHook(useArticlesActions, {
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
                    category_id: 1,
                    visibility_status: 'PUBLIC',
                },
                null,
            )

            expect(mockFetchCategoryArticleCount).toHaveBeenCalled()
            expect(saveArticles).toHaveBeenCalled()
            expect(mockInvalidateQueries).toHaveBeenCalledWith({
                queryKey,
            })
        })
    })

    describe('updateArticle()', () => {
        it('sends customer_visibility in updateArticleTranslation payload', async () => {
            const { result } = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.updateArticle('en-US', {
                ...getSingleArticleEnglish,
                translation: {
                    ...getSingleArticleEnglish.translation,
                    customer_visibility: 'UNLISTED',
                },
            })

            expect(mockUpdateArticleTranslation).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    customer_visibility: 'UNLISTED',
                    visibility_status: 'PUBLIC',
                }),
            )
        })

        it('dispatches saveArticles and pushArticleSupportedLocales actions for article in category', async () => {
            const { result } = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            const { available_locales } = await result.current.updateArticle(
                'fr-FR',
                {
                    id: 1,
                    category_id: null,
                    unlisted_id: '69b26316a6d0474d814457984a232b90',
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
                        article_unlisted_id: '69b26316a6d0474d814457984a232b90',
                        category_id: null,
                        visibility_status: 'PUBLIC',
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
                        is_current: false,
                        draft_version_id: null,
                        published_version_id: null,
                        published_datetime: null,
                        publisher_user_id: null,
                        commit_message: null,
                        version: null,
                    },
                    rating: {
                        up: 0,
                        down: 0,
                    },
                    ingested_resource_id: null,
                },
            )

            expect(mockFetchCategoryArticleCount).toHaveBeenCalled()
            expect(updateArticle).toHaveBeenCalled()
            expect(pushArticleSupportedLocales).toHaveBeenCalledWith({
                articleId: 1,
                supportedLocales: ['fr-FR'],
            })
            expect(mockInvalidateQueries).toHaveBeenCalledWith({
                queryKey,
            })
            expect(available_locales).toEqual(['en-US', 'fr-FR'])
        })

        it('does not update translation in list if its locale is not the same from the default help center locale', async () => {
            const { result } = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            const { available_locales } = await result.current.updateArticle(
                'en-US',
                {
                    id: 1,
                    unlisted_id: 'a04b78751802417989df20c2b9d21b22',
                    category_id: null,
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
                        article_unlisted_id: 'a04b78751802417989df20c2b9d21b22',
                        category_id: null,
                        visibility_status: 'PUBLIC',
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
                        is_current: false,
                        draft_version_id: null,
                        published_version_id: null,
                        published_datetime: null,
                        publisher_user_id: null,
                        commit_message: null,
                        version: null,
                    },
                    rating: {
                        up: 0,
                        down: 0,
                    },
                    ingested_resource_id: null,
                },
            )

            expect(updateArticle).toHaveBeenCalledTimes(0)
            expect(pushArticleSupportedLocales).toHaveBeenCalledWith({
                articleId: 1,
                supportedLocales: ['fr-FR'],
            })
            expect(mockInvalidateQueries).toHaveBeenCalledWith({
                queryKey,
            })
            expect(available_locales).toEqual(['en-US', 'fr-FR'])
        })
    })

    describe('deleteArticle()', () => {
        it('dispatches deleteArticle action', async () => {
            const { result } = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.deleteArticle(1)

            expect(mockFetchCategoryArticleCount).toHaveBeenCalled()
            expect(deleteArticle).toHaveBeenCalled()
            expect(mockInvalidateQueries).toHaveBeenCalledWith({
                queryKey,
            })
        })
    })

    describe('updateArticlesPositions()', () => {
        it('dispatches updateArticlesOrder action for article in category', async () => {
            const { result } = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.updateArticlesPositions(
                [getSingleArticleEnglish],
                1,
            )

            expect(updateArticlesOrder).toHaveBeenCalled()
        })

        it('dispatches updateArticlesOrder action for uncategorized article', async () => {
            const { result } = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.updateArticlesPositions(
                [getSingleArticleEnglish],
                null,
            )

            expect(updateArticlesOrder).toHaveBeenCalled()
        })
    })

    describe('deleteArticleTranslation()', () => {
        it('dispatches the removeLocaleFromArticle action', async () => {
            const { result } = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.deleteArticleTranslation(1, 'en-US')

            expect(removeLocaleFromArticle).toHaveBeenCalled()
        })

        it('invalidates the article translations query', async () => {
            const { result } = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.deleteArticleTranslation(1, 'en-US')

            expect(mockInvalidateQueries).toHaveBeenCalledWith({
                queryKey: ['help-center', 1, 'articles', 1, 'translations'],
            })
        })

        it('invalidates the articles query', async () => {
            const { result } = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.deleteArticleTranslation(1, 'en-US')

            expect(mockInvalidateQueries).toHaveBeenCalledWith({
                queryKey,
            })
        })
    })

    describe('cloneArticle()', () => {
        it('calls listArticleTranslations to get all the translations', async () => {
            const { result } = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.cloneArticle(getSingleArticleEnglish)

            expect(mockFetchCategoryArticleCount).toHaveBeenCalled()
            expect(mockListArticleTranslations).toHaveBeenCalled()
        })

        it('calls createArticle to create the article', async () => {
            const { result } = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.cloneArticle(getSingleArticleEnglish)

            expect(mockCreateArticle).toHaveBeenCalled()
        })

        it('calls createArticleTranslation to append all the translations', async () => {
            const { result } = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.cloneArticle(getSingleArticleEnglish)

            expect(mockCreateArticleTranslation).toHaveBeenCalledTimes(1)
        })

        it('includes customer_visibility in the cloned article payload', async () => {
            const { result } = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            const articleWithCustomerVisibility = {
                ...getSingleArticleEnglish,
                translation: {
                    ...getSingleArticleEnglish.translation,
                    customer_visibility: 'UNLISTED' as const,
                },
            }

            await result.current.cloneArticle(articleWithCustomerVisibility)

            expect(mockCreateArticle).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    translation: expect.objectContaining({
                        customer_visibility: 'UNLISTED',
                        visibility_status: 'PUBLIC',
                    }),
                }),
            )
        })
    })
})
