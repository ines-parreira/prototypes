import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {renderHook} from 'react-hooks-testing-library'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {initialState as helpCenterInitialState} from 'state/entities/helpCenter/reducer'
import {getCategories} from 'state/entities/helpCenter/categories'

import {useHelpCenterCategories} from '../useHelpCenterCategories'
import {useCurrentHelpCenter} from '../../providers/CurrentHelpCenter'
import {getSingleHelpCenterResponseFixture} from '../../fixtures/getHelpCentersResponse.fixture'
import {useCategoriesActions} from '../useCategoriesActions'

jest.mock('../useCategoriesActions')
;(useCategoriesActions as jest.Mock).mockReturnValue({
    fetchCategories: () => Promise.resolve(),
})

jest.mock('pages/settings/helpCenter/providers/CurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture
)

jest.mock('state/entities/helpCenter/categories', () => ({
    getCategories: jest.fn(),
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
            () => useHelpCenterCategories({locale: 'en-US'}),
            {
                wrapper: dependencyWrapper,
            }
        )
        expect(result.current.isLoading).toBeTruthy()
        await waitForNextUpdate()
        expect(result.current.isLoading).toBeFalsy()
    })

    it('uses the getCategories selector', () => {
        renderHook(() => useHelpCenterCategories({locale: 'en-US'}), {
            wrapper: dependencyWrapper,
        })
        expect(getCategories).toHaveBeenCalled()
    })
})
