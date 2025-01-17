import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {FeatureFlagKey} from 'config/featureFlags'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyAutomationPlan,
    basicYearlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import {useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters'
import {FilterKey} from 'models/stat/types'
import {OptionalFilter} from 'pages/stats/common/filters/FiltersPanel'
import {RootState} from 'state/types'

const defaultState = {
    billing: fromJS(billingState),
} as RootState

const stateWithSubscription = {
    ...defaultState,
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
} as RootState

const mockStore = configureMockStore([thunk])

describe('useGetOptionalFilters', () => {
    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewCSATFilter]: false,
            [FeatureFlagKey.AutoQAFilters]: false,
        })
    })

    it('should return the optional filters if AnalyticsNewCSATFilter is disabled', () => {
        const {result} = renderHook(
            () =>
                useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters([
                    FilterKey.Channels,
                ] as OptionalFilter[]),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            }
        )

        expect(result.current).toEqual([FilterKey.Channels])
    })

    it('should return the optional filters with score filter if AnalyticsNewCSATFilter is enabled', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewCSATFilter]: true,
        })

        const {result} = renderHook(
            () =>
                useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters([
                    FilterKey.Channels,
                ] as OptionalFilter[]),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            }
        )

        expect(result.current).toEqual([FilterKey.Channels, FilterKey.Score])
    })

    it('should return the optional filters if AutoQAFilters is disabled', () => {
        const {result} = renderHook(
            () =>
                useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters([
                    FilterKey.Channels,
                ] as OptionalFilter[]),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(stateWithSubscription)}>
                        {children}
                    </Provider>
                ),
            }
        )

        expect(result.current).toEqual([FilterKey.Channels])
    })

    it('should return the optional filters with manually scored dimensions', () => {
        mockFlags({
            [FeatureFlagKey.AutoQAFilters]: true,
        })

        const {result} = renderHook(
            () =>
                useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters([
                    FilterKey.Channels,
                ] as OptionalFilter[]),
            {
                wrapper: ({children}) => (
                    <Provider store={mockStore(stateWithSubscription)}>
                        {children}
                    </Provider>
                ),
            }
        )

        expect(result.current).toEqual([
            FilterKey.Channels,
            FilterKey.CommunicationSkills,
            FilterKey.ResolutionCompleteness,
            FilterKey.LanguageProficiency,
            FilterKey.Accuracy,
            FilterKey.BrandVoice,
            FilterKey.Efficiency,
            FilterKey.InternalCompliance,
        ])
    })
})
