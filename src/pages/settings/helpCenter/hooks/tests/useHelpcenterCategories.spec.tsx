import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {renderHook} from 'react-hooks-testing-library'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from '../../../../../state/types'
import {initialState as articlesState} from '../../../../../state/helpCenter/articles/reducer'
import {initialState as uiState} from '../../../../../state/helpCenter/ui/reducer'
import {initialState as categoriesState} from '../../../../../state/helpCenter/categories/reducer'
import {
    readCategories,
    saveCategories,
} from '../../../../../state/helpCenter/categories'

import {useHelpcenterCategories} from '../useHelpcenterCategories'

jest.mock('../useHelpcenterApi', () => {
    return {
        useHelpcenterApi: jest.fn().mockReturnValue({
            isReady: true,
            client: {
                listCategories: () =>
                    Promise.resolve({
                        data: {
                            data: [],
                        },
                    }),
                getCategoriesPositions: () => Promise.resolve({data: []}),
            },
        }),
    }
})

jest.mock('../../../../../state/helpCenter/categories', () => ({
    readCategories: jest.fn(),
    saveCategories: jest.fn().mockReturnValue({
        type: 'HELPCENTER/CATEGORIES/SAVE_CATEGORIES',
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
describe('useHelpcenterCategories', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })
    it('finishes loading once the requests are done', async () => {
        const {result, waitForNextUpdate} = renderHook(
            () => useHelpcenterCategories(1, 'en-US'),
            {
                wrapper: dependencyWrapper,
            }
        )
        expect(result.current.isLoading).toBeTruthy()
        await waitForNextUpdate()
        expect(result.current.isLoading).toBeFalsy()
    })
    it('saves the categories once they are fetched', async () => {
        const {waitForNextUpdate} = renderHook(
            () => useHelpcenterCategories(1, 'en-US'),
            {
                wrapper: dependencyWrapper,
            }
        )
        await waitForNextUpdate()
        expect(saveCategories).toHaveBeenCalled()
    })
    it('uses the readCategories selector', () => {
        renderHook(() => useHelpcenterCategories(1, 'en-US'), {
            wrapper: dependencyWrapper,
        })
        expect(readCategories).toHaveBeenCalled()
    })
})
