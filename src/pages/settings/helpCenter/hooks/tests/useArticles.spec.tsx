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
    getArticlesInCategory,
    getUncategorizedArticles,
    saveArticles,
} from '../../../../../state/helpCenter/articles'

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
                listCategoryArticles: () =>
                    Promise.resolve({
                        data: {
                            data: [],
                        },
                    }),
                listArticles: () =>
                    Promise.resolve({
                        data: {
                            data: [],
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
    getUncategorizedArticles: jest.fn(),
    getArticlesInCategory: jest.fn(),
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

// TODO: This should be extracted in a tests utils folder
const dependencyWrapper: React.ComponentType<any> = ({
    children,
}: {
    children: Element
}) => <Provider store={mockStore(defaultState)}>{children}</Provider>
describe('useArticles', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })
    it('finishes loading once the requests are done', async () => {
        const {result, waitForNextUpdate} = renderHook(() => useArticles(), {
            wrapper: dependencyWrapper,
        })
        expect(result.current.isLoading).toBeTruthy()
        await waitForNextUpdate()
        expect(result.current.isLoading).toBeFalsy()
    })
    it('saves the articles once they are fetched', async () => {
        const {waitForNextUpdate} = renderHook(() => useArticles(), {
            wrapper: dependencyWrapper,
        })
        await waitForNextUpdate()
        expect(saveArticles).toHaveBeenCalled()
    })
    it('uses the getUncategorizedArticles selector if no category is passed', () => {
        renderHook(() => useArticles(), {
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
