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
import {getArticlesResponseFixture} from '../../fixtures/getArticlesResponse.fixture'
import {useArticles} from '../useArticles'

jest.mock('react-router')
;(useParams as jest.MockedFunction<typeof useParams>).mockReturnValue({
    helpCenterId: '1',
})

const mockedListCategoryArticles = jest.fn()
const mockedListArticles = jest.fn()
const mockGetCategoryArticlesPositions = jest.fn().mockResolvedValue({data: []})
const mockGetUncategorizedArticlesPositions = jest
    .fn()
    .mockResolvedValue({data: []})

jest.mock('../useHelpCenterApi', () => {
    return {
        useHelpCenterApi: () => ({
            isReady: true,
            client: {
                listCategoryArticles: mockedListCategoryArticles,
                listArticles: mockedListArticles,
                getCategoryArticlesPositions: mockGetCategoryArticlesPositions,
                getUncategorizedArticlesPositions:
                    mockGetUncategorizedArticlesPositions,
            },
        }),
    }
})

jest.mock('../../../../../state/helpCenter/articles', () => ({
    getUncategorizedArticles: jest.fn().mockReturnValue([]),
    getArticlesInCategory: jest.fn().mockReturnValue(() => []),
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
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('allows to fetch uncategorized articles', async () => {
        mockedListArticles.mockResolvedValue({
            data: {
                data: [],
                object: 'list',
                meta: {
                    page: 1,
                    per_page: 20,
                    current_page:
                        '/help-centers/1/articles?has_category=false&page=1&per_page=20',
                    item_count: 0,
                    nb_pages: 0,
                },
            },
        })

        const {result, waitForNextUpdate} = renderHook(
            () => useArticles(null),
            {
                wrapper: dependencyWrapper,
            }
        )

        expect(result.current.articles.length).toEqual(0)
        expect(result.current.isLoading).toBeTruthy()
        expect(result.current.hasMore).toBeFalsy()
        expect(result.current.itemCount).toEqual(0)

        expect(getArticlesInCategory).not.toHaveBeenCalled()
        expect(getUncategorizedArticles).toHaveBeenCalled()

        await waitForNextUpdate()

        expect(mockedListArticles).toHaveBeenCalledWith({
            help_center_id: 1,
            has_category: false,
            per_page: 1,
            page: 1,
        })

        mockedListArticles.mockClear()

        expect(result.current.articles.length).toEqual(0)
        expect(result.current.isLoading).toBeFalsy()
        expect(result.current.hasMore).toBeFalsy()
        expect(result.current.itemCount).toEqual(0)

        void result.current.fetchMore()

        expect(mockedListArticles).not.toHaveBeenCalled()
    })

    it('allows to fetch categorized articles', async () => {
        mockedListCategoryArticles.mockResolvedValue({
            data: {
                data: [
                    {
                        ...getArticlesResponseFixture.data[1],
                        category_id: 1,
                    },
                ],
                object: 'list',
                meta: {
                    page: 1,
                    per_page: 1,
                    current_page: `/help-centers/1/categories/1/articles?page=1&per_page=1`,
                    item_count: 3,
                    nb_pages: 3,
                },
            },
        })

        const {result, waitForNextUpdate} = renderHook(
            () => useArticles(1, {per_page: 2}),
            {
                wrapper: dependencyWrapper,
            }
        )

        expect(getArticlesInCategory).toHaveBeenCalled()
        expect(getUncategorizedArticles).not.toHaveBeenCalled()

        expect(result.current.articles.length).toEqual(0)
        expect(result.current.isLoading).toBeTruthy()
        expect(result.current.hasMore).toBeFalsy()
        expect(result.current.itemCount).toEqual(0)

        await waitForNextUpdate()

        expect(mockedListCategoryArticles).toHaveBeenCalledWith({
            help_center_id: 1,
            category_id: 1,
            per_page: 1,
            page: 1,
        })

        expect(result.current.articles.length).toEqual(0)
        expect(result.current.isLoading).toBeFalsy()
        expect(result.current.hasMore).toBeTruthy()
        expect(result.current.itemCount).toEqual(3)

        mockedListCategoryArticles.mockResolvedValue({
            data: {
                data: [
                    {
                        ...getArticlesResponseFixture.data[1],
                        category_id: 1,
                    },
                    {
                        ...getArticlesResponseFixture.data[2],
                        category_id: 1,
                    },
                ],
                object: 'list',
                meta: {
                    page: 1,
                    per_page: 2,
                    current_page:
                        '/help-centers/1/categories/1/articles?page=1&per_page=2',
                    item_count: 3,
                    nb_pages: 2,
                },
            },
        })

        void result.current.fetchMore()

        expect(result.current.isLoading).toBeTruthy()

        await waitForNextUpdate()

        expect(mockedListCategoryArticles).toHaveBeenLastCalledWith({
            page: 1,
            per_page: 2,
            help_center_id: 1,
            category_id: 1,
            order_by: 'position',
        })
        expect(mockGetCategoryArticlesPositions).toHaveBeenCalledWith({
            help_center_id: 1,
            category_id: 1,
        })

        expect(saveArticles).toHaveBeenCalled()

        expect(result.current.articles.length).toEqual(2)
        expect(result.current.isLoading).toBeFalsy()
        expect(result.current.hasMore).toBeTruthy()
        expect(result.current.itemCount).toEqual(3)

        mockedListCategoryArticles.mockResolvedValue({
            data: {
                data: [
                    {
                        ...getArticlesResponseFixture.data[3],
                        category_id: 1,
                    },
                ],
                object: 'list',
                meta: {
                    page: 2,
                    per_page: 2,
                    current_page:
                        '/help-centers/1/categories/1/articles?page=2&per_page=2',
                    item_count: 3,
                    nb_pages: 2,
                },
            },
        })

        void result.current.fetchMore()

        expect(result.current.isLoading).toBeTruthy()

        await waitForNextUpdate()

        expect(mockedListCategoryArticles).toHaveBeenLastCalledWith({
            page: 2,
            per_page: 2,
            help_center_id: 1,
            category_id: 1,
            order_by: 'position',
        })

        expect(saveArticles).toHaveBeenCalled()

        expect(result.current.articles.length).toEqual(3)
        expect(result.current.isLoading).toBeFalsy()
        expect(result.current.hasMore).toBeFalsy()
        expect(result.current.itemCount).toEqual(3)
    })
})
