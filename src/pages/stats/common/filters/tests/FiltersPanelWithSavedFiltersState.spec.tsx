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
import * as statsSlice from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import * as filtersSlice from 'state/ui/stats/filtersSlice'
import {assumeMock, mockStore, renderWithStore} from 'utils/testing'

jest.mock('pages/stats/common/filters/FiltersPanel')
const FiltersPanelComponentMock = assumeMock(FiltersPanelComponent)

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
        mockFlags({
            [FeatureFlagKey.AutoQAFilters]: false,
            [FeatureFlagKey.AutoQaLanguageProficiency]: false,
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
                [FeatureFlagKey.AutoQaLanguageProficiency]: false,
                [FeatureFlagKey.AnalyticsNewCSATFilter]: false,
            },
            flagValue: true,
            expectedFilters: [
                ...SAVABLE_FILTERS,
                FilterKey.CommunicationSkills,
                FilterKey.ResolutionCompleteness,
            ],
        },
        {
            flags: {
                [FeatureFlagKey.AutoQAFilters]: true,
                [FeatureFlagKey.AutoQaLanguageProficiency]: true,
                [FeatureFlagKey.AnalyticsNewCSATFilter]: false,
            },
            flagValue: true,
            expectedFilters: [
                ...SAVABLE_FILTERS,
                FilterKey.CommunicationSkills,
                FilterKey.ResolutionCompleteness,
                FilterKey.LanguageProficiency,
            ],
        },
        {
            flags: {
                [FeatureFlagKey.AutoQAFilters]: true,
                [FeatureFlagKey.AutoQaLanguageProficiency]: true,
                [FeatureFlagKey.AnalyticsNewCSATFilter]: true,
            },
            flagValue: true,
            expectedFilters: [
                ...SAVABLE_FILTERS,
                FilterKey.Score,
                FilterKey.CommunicationSkills,
                FilterKey.ResolutionCompleteness,
                FilterKey.LanguageProficiency,
            ],
        },
    ])(
        'should render FiltersPanel with expected filters',
        ({flags, expectedFilters}) => {
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
