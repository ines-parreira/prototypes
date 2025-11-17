import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { fromJS } from 'immutable'

import { useFlag } from 'core/flags'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { SAVEABLE_FILTERS } from 'domains/reporting/pages/common/filters/constants'
import { FiltersPanelComponent } from 'domains/reporting/pages/common/filters/FiltersPanel'
import { SavedFilterComponentMap } from 'domains/reporting/pages/common/filters/FiltersPanelConfig'
import { FiltersPanelWithSavedFiltersState } from 'domains/reporting/pages/common/filters/FiltersPanelWithSavedFiltersState'
import * as statsSlice from 'domains/reporting/state/stats/statsSlice'
import * as filtersSlice from 'domains/reporting/state/ui/stats/filtersSlice'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyAutomationPlan,
    basicYearlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import { getHasAutomate } from 'state/billing/selectors'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock('state/billing/selectors', () => ({
    __esModule: true,
    getHasAutomate: jest.fn(),
}))
jest.mock('domains/reporting/pages/common/filters/FiltersPanel')
const FiltersPanelComponentMock = assumeMock(FiltersPanelComponent)
const mockGetHasAutomate = jest.mocked(getHasAutomate)

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = assumeMock(useFlag)

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
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.VoiceCallDuringBusinessHours) {
                return true
            }
        })

        renderWithStore(<FiltersPanelWithSavedFiltersState />, defaultState)

        expect(FiltersPanelComponentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                optionalFilters: SAVEABLE_FILTERS,
                filterComponentMap: SavedFilterComponentMap,
            }),
            {},
        )
    })

    it('should render FiltersPanel with own config without business hours filter', () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.VoiceCallDuringBusinessHours) {
                return false
            }
        })

        renderWithStore(<FiltersPanelWithSavedFiltersState />, defaultState)

        expect(FiltersPanelComponentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                optionalFilters: SAVEABLE_FILTERS.filter(
                    (filter) => filter !== FilterKey.IsDuringBusinessHours,
                ),
                filterComponentMap: SavedFilterComponentMap,
            }),
            {},
        )
    })
})
