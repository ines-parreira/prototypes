import React from 'react'
import {renderHook} from 'react-hooks-testing-library'
import {Provider} from 'react-redux'
import {useParams} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {CreateArticleTranslationDto} from '../../../../../models/helpCenter/types'
import {
    deleteArticle,
    pushArticleSupportedLocales,
    removeLocaleFromArticle,
    saveArticles,
    updateArticle,
    updateArticlesOrder,
} from '../../../../../state/helpCenter/articles'
import {initialState as articlesState} from '../../../../../state/helpCenter/articles/reducer'
import {initialState as categoriesState} from '../../../../../state/helpCenter/categories/reducer'
import {initialState as uiState} from '../../../../../state/helpCenter/ui/reducer'
import {RootState, StoreDispatch} from '../../../../../state/types'
import {getSingleArticleEnglish} from '../../fixtures/getArticlesResponse.fixture'
import {useArticlesActions} from '../useArticlesActions'
import {useHelpCenterApi} from '../useHelpCenterApi'

jest.mock('react-router')
;(useParams as jest.MockedFunction<typeof useParams>).mockReturnValue({
    helpCenterId: '1',
})

jest.mock('../useHelpCenterApi', () => {
    return {
        useHelpCenterApi: jest.fn().mockReturnValue({
            isReady: true,
            client: {
                createArticle: jest.fn().mockImplementation(
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
                                    created_datetime:
                                        '2021-06-01T09:46:30.044Z',
                                    updated_datetime:
                                        '2021-06-01T09:46:30.044Z',
                                    deleted_datetime: null,
                                },
                            },
                        })
                ),
                updateArticle: jest
                    .fn()
                    .mockImplementation(
                        (
                            {
                                id,
                                help_center_id,
                            }: {id: number; help_center_id: number},
                            {category_id}: {category_id: number | null}
                        ) =>
                            Promise.resolve({
                                data: {
                                    id,
                                    category_id,
                                    help_center_id,
                                    available_locales: ['fr-FR'],
                                    created_datetime:
                                        '2021-06-01T09:46:30.044Z',
                                    updated_datetime:
                                        '2021-06-01T09:46:30.044Z',
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
                                        created_datetime:
                                            '2021-06-01T09:46:30.044Z',
                                        updated_datetime:
                                            '2021-06-01T09:46:30.044Z',
                                        deleted_datetime: null,
                                    },
                                },
                            })
                    ),
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
        it('dispatches saveArticles action for uncategorized article', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.createArticle({
                locale: 'en-US',
                title: '',
                excerpt: '',
                content: '',
                slug: '',
                seo_meta: {
                    title: null,
                    description: null,
                },
            })

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

            await result.current.updateArticle({
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

            expect(
                useHelpCenterApi().client?.listArticleTranslations
            ).toHaveBeenCalled()
        })

        it('calls createArticle to create the article', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.cloneArticle(getSingleArticleEnglish)

            expect(useHelpCenterApi().client?.createArticle).toHaveBeenCalled()
        })

        it('calls createArticleTranslation to append all the translations', async () => {
            const {result} = renderHook(useArticlesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.cloneArticle(getSingleArticleEnglish)

            expect(
                useHelpCenterApi().client?.createArticleTranslation
            ).toHaveBeenCalledTimes(1)
        })
    })
})
