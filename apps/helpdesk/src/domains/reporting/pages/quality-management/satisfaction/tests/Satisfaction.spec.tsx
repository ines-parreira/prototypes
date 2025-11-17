import type { ComponentProps } from 'react'

import { assumeMock } from '@repo/testing'
import { fromJS } from 'immutable'

import { useFlag } from 'core/flags'
import type { FiltersPanelWrapper } from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { AverageScorePerDimensionTrendChart } from 'domains/reporting/pages/quality-management/satisfaction/AverageScorePerDimensionTrendChart/AverageScorePerDimensionTrendChart'
import AverageSurveyScoreDonutChart from 'domains/reporting/pages/quality-management/satisfaction/AverageSurveyScoreDonutChart/AverageSurveyScoreDonutChart'
import CommentHighlightsChart from 'domains/reporting/pages/quality-management/satisfaction/CommentHighlightsChart/CommentHighlightsChart'
import { ResponseRateTrendCard } from 'domains/reporting/pages/quality-management/satisfaction/ResponseRateTrendCard'
import { SatisfactionDownloadDataButton } from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionDownloadDataButton'
import SatisfactionReport from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionReport'
import {
    SATISFACTION_OPTIONAL_FILTERS,
    SATISFACTION_TITLE,
} from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionReportConfig'
import { SatisfactionScoreTrendCard } from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionScoreTrendCard'
import ScoredSurveyChart from 'domains/reporting/pages/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysChart'
import { SurveysSentTrendCard } from 'domains/reporting/pages/quality-management/satisfaction/SurveysSentTrendCard'
import { defaultStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import { fromLegacyStatsFilters } from 'domains/reporting/state/stats/utils'
import {
    drillDownSlice,
    initialState,
} from 'domains/reporting/state/ui/stats/drillDownSlice'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import {
    initialState as qmInitialState,
    qualityManagementSlice,
} from 'domains/reporting/state/ui/stats/qualityManagementSlice'
import { billingState } from 'fixtures/billing'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

const componentMock = () => <div />

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

jest.mock('hooks/aiAgent/useAiAgentAccess')
const useAiAgentAccessMock = assumeMock(useAiAgentAccess)

jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    },
)

jest.mock(
    'domains/reporting/pages/quality-management/satisfaction/SatisfactionScoreTrendCard',
)
const SatisfactionScoreTrendCardMock = assumeMock(SatisfactionScoreTrendCard)

jest.mock(
    'domains/reporting/pages/quality-management/satisfaction/ResponseRateTrendCard',
)
const ResponseRateTrendCardMock = assumeMock(ResponseRateTrendCard)

jest.mock(
    'domains/reporting/pages/quality-management/satisfaction/SurveysSentTrendCard',
)
const SurveysSentTrendCardMock = assumeMock(SurveysSentTrendCard)
jest.mock(
    'domains/reporting/pages/quality-management/satisfaction/SatisfactionDownloadDataButton',
)
jest.mock(
    'domains/reporting/pages/quality-management/satisfaction/AverageScorePerDimensionTrendChart/AverageScorePerDimensionTrendChart',
)
const SatisfactionDownloadDataButtonMock = assumeMock(
    SatisfactionDownloadDataButton,
)
const AverageScorePerDimensionTrendChartMock = assumeMock(
    AverageScorePerDimensionTrendChart,
)

jest.mock(
    'domains/reporting/hooks/quality-management/satisfaction/useSatisfactionMetrics',
)

jest.mock(
    'domains/reporting/pages/quality-management/satisfaction/AverageSurveyScoreDonutChart/AverageSurveyScoreDonutChart',
)
const AverageSurveyScoreDonutChartMock = assumeMock(
    AverageSurveyScoreDonutChart,
)

jest.mock(
    'domains/reporting/pages/quality-management/satisfaction/CommentHighlightsChart/CommentHighlightsChart',
)
const CommentHighlightsChartMock = assumeMock(CommentHighlightsChart)

jest.mock(
    'domains/reporting/pages/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysChart',
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
        useFlagMock.mockReturnValue(true)
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
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
