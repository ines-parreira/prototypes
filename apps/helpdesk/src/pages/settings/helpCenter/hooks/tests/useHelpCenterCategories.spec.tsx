import React from 'react'

import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { getCategories } from 'state/entities/helpCenter/categories'
import { initialState as helpCenterInitialState } from 'state/entities/helpCenter/reducer'
import { RootState, StoreDispatch } from 'state/types'
import { initialState as uiState } from 'state/ui/helpCenter/reducer'

import { getSingleHelpCenterResponseFixture } from '../../fixtures/getHelpCentersResponse.fixture'
import useCurrentHelpCenter from '../../hooks/useCurrentHelpCenter'
import { useCategoriesActions } from '../useCategoriesActions'
import { useHelpCenterCategories } from '../useHelpCenterCategories'

jest.mock('../useCategoriesActions')
;(useCategoriesActions as jest.Mock).mockReturnValue({
    fetchCategories: () => Promise.resolve(),
})

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture,
)

jest.mock('state/entities/helpCenter/categories', () => ({
    getCategories: jest.fn(),
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: helpCenterInitialState,
    } as any,
    ui: { helpCenter: uiState } as any,
}

// TODO: This should be extracted in a tests utils folder
const dependencyWrapper: React.ComponentType<any> = ({
    children,
}: {
    children: React.ReactNode
}) => <Provider store={mockStore(defaultState)}>{children}</Provider>

describe('useHelpCenterCategories', () => {
    it('finishes loading once the requests are done', async () => {
        const { result } = renderHook(
            () => useHelpCenterCategories({ locale: 'en-US' }),
            {
                wrapper: dependencyWrapper,
            },
        )
        expect(result.current.isLoading).toBeTruthy()
        await waitFor(() => {
            expect(result.current.isLoading).toBeFalsy()
        })
    })

    it('uses the getCategories selector', () => {
        renderHook(() => useHelpCenterCategories({ locale: 'en-US' }), {
            wrapper: dependencyWrapper,
        })
        expect(getCategories).toHaveBeenCalled()
    })
})
