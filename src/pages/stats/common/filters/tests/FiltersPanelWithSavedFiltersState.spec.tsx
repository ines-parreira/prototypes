import {fromJS} from 'immutable'
import React from 'react'

import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyAutomationPlan,
    basicYearlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import {FiltersPanelComponent} from 'pages/stats/common/filters/FiltersPanel'
import {SavedFilterComponentMap} from 'pages/stats/common/filters/FiltersPanelConfig'
import {FiltersPanelWithSavedFiltersState} from 'pages/stats/common/filters/FiltersPanelWithSavedFiltersState'
import {getHasAutomate} from 'state/billing/selectors'
import * as statsSlice from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import * as filtersSlice from 'state/ui/stats/filtersSlice'
import {assumeMock, renderWithStore} from 'utils/testing'

import {SAVEABLE_FILTERS} from '../constants'

jest.mock('state/billing/selectors', () => ({
    __esModule: true,
    getHasAutomate: jest.fn(),
}))
jest.mock('pages/stats/common/filters/FiltersPanel')
const FiltersPanelComponentMock = assumeMock(FiltersPanelComponent)
const mockGetHasAutomate = jest.mocked(getHasAutomate)

describe('SavedFiltersPanel', () => {
    const defaultState = {
        billing: fromJS(billingState),
        currentAccount: fromJS({
            ...account,
            current_subscription: {
                products: {
                    [HELPDESK_PRODUCT_ID]: basicYearlyHelpdeskPlan.price_id,
                    [AUTOMATION_PRODUCT_ID]: basicYearlyAutomationPlan.price_id,
                },
                status: 'active',
            },
        }),
        stats: statsSlice.initialState,
        ui: {
            stats: {
                filters: filtersSlice.initialState,
            },
        },
    } as RootState
    beforeEach(() => {
        mockGetHasAutomate.mockReturnValue(false)
        FiltersPanelComponentMock.mockImplementation(() => <div />)
    })

    it('should render FiltersPanel with own config', () => {
        renderWithStore(<FiltersPanelWithSavedFiltersState />, defaultState)

        expect(FiltersPanelComponentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                optionalFilters: SAVEABLE_FILTERS,
                filterComponentMap: SavedFilterComponentMap,
            }),
            {}
        )
    })
})
