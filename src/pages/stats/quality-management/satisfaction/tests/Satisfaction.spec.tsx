import React, { ComponentProps } from 'react'

import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'

import { FeatureFlagKey } from 'config/featureFlags'
import { billingState } from 'fixtures/billing'
import { FiltersPanelWrapper } from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { AverageScorePerDimensionTrendChart } from 'pages/stats/quality-management/satisfaction/AverageScorePerDimensionTrendChart/AverageScorePerDimensionTrendChart'
import AverageSurveyScoreDonutChart from 'pages/stats/quality-management/satisfaction/AverageSurveyScoreDonutChart/AverageSurveyScoreDonutChart'
import CommentHighlightsChart from 'pages/stats/quality-management/satisfaction/CommentHighlightsChart/CommentHighlightsChart'
import { ResponseRateTrendCard } from 'pages/stats/quality-management/satisfaction/ResponseRateTrendCard'
import { SatisfactionDownloadDataButton } from 'pages/stats/quality-management/satisfaction/SatisfactionDownloadDataButton'
import SatisfactionReport from 'pages/stats/quality-management/satisfaction/SatisfactionReport'
import {
    SATISFACTION_OPTIONAL_FILTERS,
    SATISFACTION_TITLE,
} from 'pages/stats/quality-management/satisfaction/SatisfactionReportConfig'
import { SatisfactionScoreTrendCard } from 'pages/stats/quality-management/satisfaction/SatisfactionScoreTrendCard'
import ScoredSurveyChart from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysChart'
import { SurveysSentTrendCard } from 'pages/stats/quality-management/satisfaction/SurveysSentTrendCard'
import { defaultStatsFilters } from 'state/stats/statsSlice'
import { fromLegacyStatsFilters } from 'state/stats/utils'
import { RootState } from 'state/types'
import { drillDownSlice, initialState } from 'state/ui/stats/drillDownSlice'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import {
    initialState as qmInitialState,
    qualityManagementSlice,
} from 'state/ui/stats/qualityManagementSlice'
import { assumeMock, renderWithStore } from 'utils/testing'

const componentMock = () => <div />

jest.mock(
    'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    },
)

jest.mock(
    'pages/stats/quality-management/satisfaction/SatisfactionScoreTrendCard',
)
const SatisfactionScoreTrendCardMock = assumeMock(SatisfactionScoreTrendCard)

jest.mock('pages/stats/quality-management/satisfaction/ResponseRateTrendCard')
const ResponseRateTrendCardMock = assumeMock(ResponseRateTrendCard)

jest.mock('pages/stats/quality-management/satisfaction/SurveysSentTrendCard')
const SurveysSentTrendCardMock = assumeMock(SurveysSentTrendCard)
jest.mock(
    'pages/stats/quality-management/satisfaction/SatisfactionDownloadDataButton',
)
jest.mock(
    'pages/stats/quality-management/satisfaction/AverageScorePerDimensionTrendChart/AverageScorePerDimensionTrendChart',
)
const SatisfactionDownloadDataButtonMock = assumeMock(
    SatisfactionDownloadDataButton,
)
const AverageScorePerDimensionTrendChartMock = assumeMock(
    AverageScorePerDimensionTrendChart,
)

jest.mock(
    'hooks/reporting/quality-management/satisfaction/useSatisfactionMetrics',
)

jest.mock(
    'pages/stats/quality-management/satisfaction/AverageSurveyScoreDonutChart/AverageSurveyScoreDonutChart',
)
const AverageSurveyScoreDonutChartMock = assumeMock(
    AverageSurveyScoreDonutChart,
)

jest.mock(
    'pages/stats/quality-management/satisfaction/CommentHighlightsChart/CommentHighlightsChart',
)
const CommentHighlightsChartMock = assumeMock(CommentHighlightsChart)

jest.mock(
    'pages/stats/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysChart',
)
const ScoredSurveyChartMock = assumeMock(ScoredSurveyChart)

describe('<Satisfaction>', () => {
    const defaultState = {
        stats: {
            filters: fromLegacyStatsFilters(defaultStatsFilters),
        },
        ui: {
            stats: {
                filters: uiStatsInitialState,
                [drillDownSlice.name]: initialState,
                [qualityManagementSlice.name]: qmInitialState,
            },
        },
        billing: fromJS(billingState),
    } as RootState

    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.NewSatisfactionReport]: true,
        })
        SatisfactionScoreTrendCardMock.mockImplementation(componentMock)
        ResponseRateTrendCardMock.mockImplementation(componentMock)
        SurveysSentTrendCardMock.mockImplementation(componentMock)
        AverageSurveyScoreDonutChartMock.mockImplementation(componentMock)
        SatisfactionDownloadDataButtonMock.mockImplementation(componentMock)
        CommentHighlightsChartMock.mockImplementation(componentMock)
        AverageScorePerDimensionTrendChartMock.mockImplementation(componentMock)
        ScoredSurveyChartMock.mockImplementation(componentMock)
    })

    it('should render new satisfaction report page', () => {
        const { getByText } = renderWithStore(
            <SatisfactionReport />,
            defaultState,
        )

        expect(getByText(SATISFACTION_TITLE)).toBeInTheDocument()
        expect(SatisfactionScoreTrendCardMock).toHaveBeenCalled()
        expect(ResponseRateTrendCardMock).toHaveBeenCalled()
        expect(SurveysSentTrendCardMock).toHaveBeenCalled()
        expect(AverageSurveyScoreDonutChartMock).toHaveBeenCalled()
        expect(CommentHighlightsChartMock).toHaveBeenCalled()
        expect(AverageScorePerDimensionTrendChartMock).toHaveBeenCalled()
        expect(SatisfactionDownloadDataButtonMock).toHaveBeenCalled()
    })

    it('should contain filters panel component', () => {
        const { getByText } = renderWithStore(
            <SatisfactionReport />,
            defaultState,
        )

        SATISFACTION_OPTIONAL_FILTERS.forEach((optionalFilter) => {
            expect(getByText(optionalFilter)).toBeInTheDocument()
            expect(SatisfactionScoreTrendCardMock).toHaveBeenCalled()
            expect(ResponseRateTrendCardMock).toHaveBeenCalled()
            expect(SurveysSentTrendCardMock).toHaveBeenCalled()
            expect(AverageSurveyScoreDonutChartMock).toHaveBeenCalled()
            expect(CommentHighlightsChartMock).toHaveBeenCalled()
            expect(AverageScorePerDimensionTrendChartMock).toHaveBeenCalled()
            expect(SatisfactionDownloadDataButtonMock).toHaveBeenCalled()
        })
    })
})
