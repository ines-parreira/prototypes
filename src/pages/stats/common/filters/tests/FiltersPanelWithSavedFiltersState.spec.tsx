import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {Provider} from 'react-redux'

import {FeatureFlagKey} from 'config/featureFlags'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyAutomationPlan,
    basicYearlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import {SAVABLE_FILTERS} from 'models/reporting/types'
import {FilterKey} from 'models/stat/types'
import {
    FiltersPanelComponent,
    FiltersPanelProps,
} from 'pages/stats/common/filters/FiltersPanel'
import {SavedFilterComponentMap} from 'pages/stats/common/filters/FiltersPanelConfig'
import {
    FiltersPanelWithSavedFiltersState,
    FiltersPanelWithCustomFilters,
} from 'pages/stats/common/filters/FiltersPanelWithSavedFiltersState'
import {getHasAutomate} from 'state/billing/selectors'
import * as statsSlice from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import * as filtersSlice from 'state/ui/stats/filtersSlice'
import {assumeMock, mockStore, renderWithStore} from 'utils/testing'

import {AUTO_QA_FILTER_KEYS} from '../helpers'

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

    const minimalProps = {optionalFilters: []} as unknown as FiltersPanelProps

    beforeEach(() => {
        mockGetHasAutomate.mockReturnValue(false)
        mockFlags({
            [FeatureFlagKey.AutoQAFilters]: false,
            [FeatureFlagKey.AnalyticsNewCSATFilter]: false,
        })
        FiltersPanelComponentMock.mockImplementation(() => <div />)
    })

    it('should render FiltersPanel with own config', () => {
        renderWithStore(<FiltersPanelWithSavedFiltersState />, defaultState)

        expect(FiltersPanelComponentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                optionalFilters: SAVABLE_FILTERS,
                filterComponentMap: SavedFilterComponentMap,
            }),
            {}
        )
    })

    it.each([
        {
            flags: {
                [FeatureFlagKey.AutoQAFilters]: true,
                [FeatureFlagKey.AnalyticsNewCSATFilter]: false,
            },
            hasAutomate: true,
            expectedFilters: [...SAVABLE_FILTERS, ...AUTO_QA_FILTER_KEYS],
        },
        {
            flags: {
                [FeatureFlagKey.AutoQAFilters]: true,
                [FeatureFlagKey.AnalyticsNewCSATFilter]: true,
            },
            hasAutomate: true,
            expectedFilters: [
                ...SAVABLE_FILTERS,
                FilterKey.Score,
                ...AUTO_QA_FILTER_KEYS,
            ],
        },

        {
            flags: {
                [FeatureFlagKey.AutoQAFilters]: true,
                [FeatureFlagKey.AnalyticsNewCSATFilter]: true,
            },
            hasAutomate: false,
            expectedFilters: [...SAVABLE_FILTERS, FilterKey.Score],
        },
        {
            flags: {
                [FeatureFlagKey.AutoQAFilters]: false,
                [FeatureFlagKey.AnalyticsNewCSATFilter]: true,
            },
            hasAutomate: true,
            expectedFilters: [...SAVABLE_FILTERS, FilterKey.Score],
        },
        {
            flags: {
                [FeatureFlagKey.AutoQAFilters]: false,
                [FeatureFlagKey.AnalyticsNewCSATFilter]: true,
            },
            hasAutomate: false,
            expectedFilters: [...SAVABLE_FILTERS, FilterKey.Score],
        },
        {
            flags: {
                [FeatureFlagKey.AutoQAFilters]: false,
                [FeatureFlagKey.AnalyticsNewCSATFilter]: false,
            },
            hasAutomate: false,
            expectedFilters: [...SAVABLE_FILTERS],
        },
    ])(
        'should render FiltersPanel with expected filters',
        ({flags, expectedFilters, hasAutomate}) => {
            mockGetHasAutomate.mockReturnValue(hasAutomate)
            mockFlags(flags)
            render(
                <Provider store={mockStore(defaultState)}>
                    <FiltersPanelWithCustomFilters {...minimalProps} />
                </Provider>
            )

            expect(FiltersPanelComponentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    optionalFilters: expectedFilters,
                }),
                {}
            )
        }
    )
})
