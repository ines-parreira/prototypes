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
    readArticlesInCategory,
    readUncategorizedArticles,
    saveArticles,
} from '../../../../../state/helpCenter/articles'

import {useArticles} from '../useArticles'

jest.mock('react-router')
;(useParams as jest.MockedFunction<typeof useParams>).mockReturnValue({
    helpcenterId: '1',
})

jest.mock('../useHelpcenterApi', () => {
    return {
        useHelpcenterApi: jest.fn().mockReturnValue({
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
    readUncategorizedArticles: jest.fn(),
    readArticlesInCategory: jest.fn(),
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
        const {result, waitForNextUpdate} = renderHook(
            () => useArticles('en-US'),
            {
                wrapper: dependencyWrapper,
            }
        )
        expect(result.current.isLoading).toBeTruthy()
        await waitForNextUpdate()
        expect(result.current.isLoading).toBeFalsy()
    })
    it('saves the articles once they are fetched', async () => {
        const {waitForNextUpdate} = renderHook(() => useArticles('en-US'), {
            wrapper: dependencyWrapper,
        })
        await waitForNextUpdate()
        expect(saveArticles).toHaveBeenCalled()
    })
    it('uses the readUncategorizedArticles selector if no category is passed', () => {
        renderHook(() => useArticles('en-US'), {
            wrapper: dependencyWrapper,
        })
        expect(readUncategorizedArticles).toHaveBeenCalled()
        expect(readArticlesInCategory).not.toHaveBeenCalled()
    })
    it('uses the readArticlesInCategory selector if category is passed', () => {
        renderHook(() => useArticles('en-US', 1), {
            wrapper: dependencyWrapper,
        })
        expect(readUncategorizedArticles).not.toHaveBeenCalled()
        expect(readArticlesInCategory).toHaveBeenCalled()
    })
})
