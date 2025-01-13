import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'

import React, {ComponentProps} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {billingState} from 'fixtures/billing'
import {useSatisfactionMetrics} from 'hooks/reporting/quality-management/satisfaction/useSatisfactionMetrics'
import {FiltersPanelWrapper} from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import {ResponseRateTrendCard} from 'pages/stats/quality-management/satisfaction/ResponseRateTrendCard'
import SatisfactionReport from 'pages/stats/quality-management/satisfaction/SatisfactionReport'
import {
    SATISFACTION_OPTIONAL_FILTERS,
    SATISFACTION_TITLE,
} from 'pages/stats/quality-management/satisfaction/SatisfactionReportConfig'
import {SatisfactionScoreTrendCard} from 'pages/stats/quality-management/satisfaction/SatisfactionScoreTrendCard'
import {SurveysSentTrendCard} from 'pages/stats/quality-management/satisfaction/SurveysSentTrendCard'
import {defaultStatsFilters} from 'state/stats/statsSlice'
import {fromLegacyStatsFilters} from 'state/stats/utils'
import {RootState} from 'state/types'
import {drillDownSlice, initialState} from 'state/ui/stats/drillDownSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/filtersSlice'
import {assumeMock, renderWithStore} from 'utils/testing'

const componentMock = () => <div />

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

jest.mock(
    'pages/stats/quality-management/satisfaction/SatisfactionScoreTrendCard'
)
const SatisfactionScoreTrendCardMock = assumeMock(SatisfactionScoreTrendCard)

jest.mock('pages/stats/quality-management/satisfaction/ResponseRateTrendCard')
const ResponseRateTrendCardMock = assumeMock(ResponseRateTrendCard)

jest.mock('pages/stats/quality-management/satisfaction/SurveysSentTrendCard')
const SurveysSentTrendCardMock = assumeMock(SurveysSentTrendCard)

jest.mock(
    'hooks/reporting/quality-management/satisfaction/useSatisfactionMetrics'
)
const useSatisfactionMetricsMock = assumeMock(useSatisfactionMetrics)

describe('<Satisfaction>', () => {
    const reportData = {} as any
    const isLoading = false
    const period = {
        start_datetime: '2021-04-02T00:00:00.000Z',
        end_datetime: '2021-04-02T23:59:59.999Z',
    }
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
        billing: fromJS(billingState),
    } as RootState

    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
            [FeatureFlagKey.NewSatisfactionReport]: true,
        })
        useSatisfactionMetricsMock.mockReturnValue({
            reportData,
            isLoading,
            period,
        })
        SatisfactionScoreTrendCardMock.mockImplementation(componentMock)
        ResponseRateTrendCardMock.mockImplementation(componentMock)
        SurveysSentTrendCardMock.mockImplementation(componentMock)
    })

    it('should render new satisfaction report page', () => {
        const {getByText} = renderWithStore(
            <SatisfactionReport />,
            defaultState
        )

        expect(getByText(SATISFACTION_TITLE)).toBeInTheDocument()
        expect(SatisfactionScoreTrendCardMock).toHaveBeenCalled()
        expect(ResponseRateTrendCardMock).toHaveBeenCalled()
        expect(SurveysSentTrendCardMock).toHaveBeenCalled()
    })

    it('should contain filters panel component', () => {
        const {getByText} = renderWithStore(
            <SatisfactionReport />,
            defaultState
        )

        SATISFACTION_OPTIONAL_FILTERS.forEach((optionalFilter) => {
            expect(getByText(optionalFilter)).toBeInTheDocument()
            expect(SatisfactionScoreTrendCardMock).toHaveBeenCalled()
            expect(ResponseRateTrendCardMock).toHaveBeenCalled()
            expect(SurveysSentTrendCardMock).toHaveBeenCalled()
        })
    })
})
