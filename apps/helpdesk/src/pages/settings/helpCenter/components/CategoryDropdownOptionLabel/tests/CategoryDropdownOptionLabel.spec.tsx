import React from 'react'

import { render } from '@repo/testing'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { keyBy } from '@gorgias/toolkit'

import { getCategoriesFlatSorted } from 'pages/settings/helpCenter/fixtures/getCategoriesTreeFlatSorted.fixtures'
import { initialState as helpCenterState } from 'state/entities/helpCenter/reducer'
import type { RootState, StoreDispatch } from 'state/types'
import { initialState as uiState } from 'state/ui/helpCenter/reducer'

import { CategoryDropdownOptionLabel } from '../CategoryDropdownOptionLabel'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            ...helpCenterState,
            categories: {
                categoriesById: keyBy(getCategoriesFlatSorted, 'id'),
            },
        },
    } as any,
    ui: {
        helpCenter: uiState,
    } as any,
}

const store = mockStore(defaultState)

describe('<CategoryDropdownOptionLabel />', () => {
    it('matches snapshot', () => {
        const category = getCategoriesFlatSorted[1]
        const { container } = render(
            <Provider store={store}>
                <CategoryDropdownOptionLabel category={category} />
            </Provider>,
        )

        expect(container).toMatchSnapshot()
    })
})
