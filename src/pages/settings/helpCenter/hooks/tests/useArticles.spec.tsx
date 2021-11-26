import React from 'react'
import {renderHook} from 'react-hooks-testing-library'
import {Provider} from 'react-redux'
import {useParams} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    getArticlesInCategory,
    getUncategorizedArticles,
    saveArticles,
} from '../../../../../state/helpCenter/articles'
import {initialState as articlesState} from '../../../../../state/helpCenter/articles/reducer'
import {initialState as categoriesState} from '../../../../../state/helpCenter/categories/reducer'
import {initialState as uiState} from '../../../../../state/helpCenter/ui/reducer'
import {RootState, StoreDispatch} from '../../../../../state/types'
import {useArticles} from '../useArticles'

jest.mock('react-router')
;(useParams as jest.MockedFunction<typeof useParams>).mockReturnValue({
    helpCenterId: '1',
})

jest.mock('../useHelpCenterApi', () => {
    return {
        useHelpCenterApi: jest.fn().mockReturnValue({
            isReady: true,
            client: {
                listCategoryArticles: ({
                    per_page,
                    help_center_id,
                    category_id,
                    page,
                }: {
                    per_page: number
                    help_center_id: number
                    category_id: number
                    page: number
                }) =>
                    Promise.resolve({
                        data: {
                            data: [
                                {
                                    id: 2,
                                    category_id,
                                    help_center_id,
                                    created_datetime:
                                        '2021-05-17T18:21:42.022Z',
                                    updated_datetime:
                                        '2021-05-17T18:21:42.022Z',
                                    deleted_datetime: null,
                                    available_locales: ['en-US'],
                                    translation: {
                                        title: 'English only post',
                                        excerpt:
                                            'This article only exists in english',
                                        slug: 'in-eng-only',
                                        article_id: 2,
                                        created_datetime:
                                            '2021-05-17T18:21:42.022Z',
                                        updated_datetime:
                                            '2021-05-17T18:21:42.022Z',
                                        deleted_datetime: null,
                                        locale: 'en-US',
                                        content: 'Article content',
                                        seo_meta: {
                                            title: null,
                                            description: null,
                                        },
                                    },
                                },
                                {
                                    id: 3,
                                    category_id,
                                    help_center_id,
                                    created_datetime:
                                        '2021-05-17T18:21:42.022Z',
                                    updated_datetime:
                                        '2021-05-17T18:21:42.022Z',
                                    deleted_datetime: null,
                                    available_locales: ['en-US'],
                                    translation: {
                                        title: 'English only post',
                                        excerpt:
                                            'This article only exists in english',
                                        slug: 'in-eng-only',
                                        article_id: 3,
                                        created_datetime:
                                            '2021-05-17T18:21:42.022Z',
                                        updated_datetime:
                                            '2021-05-17T18:21:42.022Z',
                                        deleted_datetime: null,
                                        locale: 'en-US',
                                        content: 'Article content',
                                        seo_meta: {
                                            title: null,
                                            description: null,
                                        },
                                    },
                                },
                            ],
                            object: 'list',
                            meta: {
                                page,
                                per_page,
                                current_page: `/help-centers/1/articles?per_page=${per_page}&page=${page}`,
                                item_count: 2,
                                nb_pages: 2,
                            },
                        },
                    }),
                listArticles: ({
                    per_page,
                    help_center_id,
                    has_category,
                    page,
                }: {
                    per_page: number
                    help_center_id: number
                    has_category: boolean
                    page: number
                }) =>
                    Promise.resolve({
                        data: {
                            data: [
                                {
                                    id: 1,
                                    category_id: null,
                                    help_center_id,
                                    created_datetime:
                                        '2021-05-17T18:21:42.022Z',
                                    updated_datetime:
                                        '2021-05-17T18:21:42.022Z',
                                    deleted_datetime: undefined,
                                    available_locales: ['en-US'],
                                    translation: {
                                        title: 'Free article (EN)',
                                        excerpt:
                                            'Paragraph lorem ipsum, Yiddish xylophone wonder.',
                                        slug: 'free-article',
                                        article_id: 1,
                                        created_datetime:
                                            '2021-05-17T18:21:42.022Z',
                                        updated_datetime:
                                            '2021-05-17T18:21:42.022Z',
                                        deleted_datetime: undefined,
                                        locale: 'en-US',
                                        content: 'Article content',
                                        seo_meta: {
                                            title: null,
                                            description: null,
                                        },
                                    },
                                },
                            ],
                            object: 'list',
                            meta: {
                                page,
                                per_page,
                                current_page: `/help-centers/1/articles?per_page=${per_page}&page=${page}&has_category=${
                                    has_category ? 'true' : 'false'
                                }`,
                                item_count: 1,
                                nb_pages: 1,
                            },
                        },
                    }),
                getCategoryArticlesPositions: () => Promise.resolve({data: []}),
                getUncategorizedArticlesPositions: () =>
                    Promise.resolve({data: []}),
            },
        }),
    }
})

jest.mock('../../../../../state/helpCenter/articles', () => ({
    getUncategorizedArticles: jest.fn().mockReturnValue([]),
    getArticlesInCategory: jest.fn().mockReturnValue([]),
    saveArticles: jest.fn().mockReturnValue({
        type: 'HELPCENTER/ARTICLES/SAVE_ARTICLES',
        payload: {},
    }),
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    helpCenter: {
        ui: uiState,
        articles: articlesState,
        categories: categoriesState,
    },
}
const store = mockStore(defaultState)

// TODO: This should be extracted in a tests utils folder
const dependencyWrapper: React.ComponentType<any> = ({
    children,
}: {
    children: Element
}) => <Provider store={store}>{children}</Provider>

describe('useArticles()', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('finishes loading once the requests are done', async () => {
        const {result, waitForNextUpdate} = renderHook(
            () => useArticles(null, {per_page: 20}),
            {
                wrapper: dependencyWrapper,
            }
        )
        expect(result.current.isLoading).toBeTruthy()
        await waitForNextUpdate()
        expect(result.current.articles.length).toEqual(1)
        expect(result.current.itemCount).toEqual(1)
        expect(result.current.hasMore).toBeFalsy()
        expect(result.current.isLoading).toBeFalsy()
    })

    it('saves the articles once they are fetched', async () => {
        const {waitForNextUpdate} = renderHook(() => useArticles(null), {
            wrapper: dependencyWrapper,
        })
        await waitForNextUpdate()
        expect(saveArticles).toHaveBeenCalled()
    })

    it('uses the getUncategorizedArticles selector if no category is passed', () => {
        renderHook(() => useArticles(null), {
            wrapper: dependencyWrapper,
        })
        expect(getUncategorizedArticles).toHaveBeenCalled()
        expect(getArticlesInCategory).not.toHaveBeenCalled()
    })

    it('uses the getArticlesInCategory selector if category is passed', () => {
        renderHook(() => useArticles(1), {
            wrapper: dependencyWrapper,
        })
        expect(getUncategorizedArticles).not.toHaveBeenCalled()
        expect(getArticlesInCategory).toHaveBeenCalled()
    })
})
