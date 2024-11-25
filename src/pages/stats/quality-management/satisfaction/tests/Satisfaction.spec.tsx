import {mockFlags} from 'jest-launchdarkly-mock'
import React, {ComponentProps} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import Satisfaction, {
    SATISFACTION_OPTIONAL_FILTERS,
    SATISFACTION_TITLE,
} from 'pages/stats/quality-management/satisfaction/Satisfaction'
import {defaultStatsFilters} from 'state/stats/statsSlice'
import {fromLegacyStatsFilters} from 'state/stats/utils'
import {RootState} from 'state/types'
import {drillDownSlice, initialState} from 'state/ui/stats/drillDownSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/filtersSlice'
import {renderWithStore} from 'utils/testing'

jest.mock(
    'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    }
)
jest.mock('pages/stats/support-performance/SupportPerformanceFilters', () => ({
    SupportPerformanceFilters: () => <div />,
}))

describe('<Satisfaction>', () => {
    const defaultState = {
        stats: {
            filters: fromLegacyStatsFilters(defaultStatsFilters),
        },
        ui: {
            stats: {
                filters: uiStatsInitialState,
                [drillDownSlice.name]: initialState,
            },
        },
    } as RootState

    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
            [FeatureFlagKey.NewSatisfactionReport]: true,
        })
    })

    it('should render new satisfaction report page', () => {
        const {getByText} = renderWithStore(<Satisfaction />, defaultState)

        expect(getByText(SATISFACTION_TITLE)).toBeInTheDocument()
    })

    it('should contain filters panel component', () => {
        const {getByText} = renderWithStore(<Satisfaction />, defaultState)

        SATISFACTION_OPTIONAL_FILTERS.forEach((optionalFilter) => {
            expect(getByText(optionalFilter)).toBeInTheDocument()
        })
    })
})
