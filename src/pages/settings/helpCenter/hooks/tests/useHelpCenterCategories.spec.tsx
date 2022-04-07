import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {renderHook} from 'react-hooks-testing-library'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {initialState as helpCenterInitialState} from 'state/entities/helpCenter/reducer'
import {
    getCategories,
    saveCategories,
} from 'state/entities/helpCenter/categories'

import {useHelpCenterCategories} from '../useHelpCenterCategories'
import {useCurrentHelpCenter} from '../../providers/CurrentHelpCenter'
import {getSingleHelpCenterResponseFixture} from '../../fixtures/getHelpCentersResponse.fixture'

jest.mock('../useHelpCenterApi', () => {
    return {
        useHelpCenterApi: jest.fn().mockReturnValue({
            isReady: true,
            client: {
                getCategoryTree: () =>
                    Promise.resolve({
                        data: {
                            created_datetime: '2022-03-07T14:46:47.212Z',
                            updated_datetime: '2022-03-07T14:46:47.212Z',
                            deleted_datetime: null,
                            id: 0,
                            help_center_id: 3,
                            available_locales: [],
                            children: [],
                            articles: [],
                            translation: null,
                        },
                    }),
                getCategoriesPositions: () => Promise.resolve({data: []}),
            },
        }),
    }
})

jest.mock('pages/settings/helpCenter/providers/CurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture
)

jest.mock('state/entities/helpCenter/categories', () => ({
    getCategories: jest.fn(),
    saveCategories: jest.fn().mockReturnValue({
        type: 'HELPCENTER/CATEGORIES/SAVE_CATEGORIES',
        payload: {},
    }),
    savePositions: jest.fn().mockReturnValue({
        type: 'HELPCENTER/CATEGORIES/SAVE_POSITIONS',
        payload: [],
    }),
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: helpCenterInitialState,
    } as any,
    ui: {helpCenter: uiState} as any,
}

// TODO: This should be extracted in a tests utils folder
const dependencyWrapper: React.ComponentType<any> = ({
    children,
}: {
    children: Element
}) => <Provider store={mockStore(defaultState)}>{children}</Provider>

describe('useHelpCenterCategories', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('finishes loading once the requests are done', async () => {
        const {result, waitForNextUpdate} = renderHook(
            () => useHelpCenterCategories(1, {locale: 'en-US'}),
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
            () => useHelpCenterCategories(1, {locale: 'en-US'}),
            {
                wrapper: dependencyWrapper,
            }
        )
        await waitForNextUpdate()
        expect(saveCategories).toHaveBeenCalled()
    })

    it('uses the getCategories selector', () => {
        renderHook(() => useHelpCenterCategories(1, {locale: 'en-US'}), {
            wrapper: dependencyWrapper,
        })
        expect(getCategories).toHaveBeenCalled()
    })
})
