import React from 'react'

import { render, screen } from '@testing-library/react'
import moment from 'moment'

import { useCommentHighlights } from 'hooks/reporting/quality-management/satisfaction/useCommentHighlights'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import CommentHighlightsCarousel from 'pages/stats/quality-management/satisfaction/CommentHighlightsChart/CommentHighlightsCarousel'
import CommentHighlightsChart from 'pages/stats/quality-management/satisfaction/CommentHighlightsChart/CommentHighlightsChart'
import CommentHighlightCsatSentimentToggle from 'pages/stats/quality-management/satisfaction/CommentHighlightsChart/CommentHighlightsCsatSentimentToggle'
import { CsatSentiment } from 'state/ui/stats/types'
import { formatReportingQueryDate } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock(
    'hooks/reporting/quality-management/satisfaction/useCommentHighlights',
)
const useCommentHighlightsMock = assumeMock(useCommentHighlights)

jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock(
    'pages/stats/quality-management/satisfaction/CommentHighlightsChart/CommentHighlightsCarousel',
)
const CommentHighlightsCarouselMock = assumeMock(CommentHighlightsCarousel)

jest.mock(
    'pages/stats/quality-management/satisfaction/CommentHighlightsChart/CommentHighlightsCsatSentimentToggle',
)
const CommentHighlightCsatSentimentToggleMock = assumeMock(
    CommentHighlightCsatSentimentToggle,
)

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)

const renderComponent = () => {
    render(<CommentHighlightsChart />)
}

describe('<CommentHighlightsChart/>', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment().subtract(7, 'd'))
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: periodStart,
            end_datetime: periodEnd,
        },
    }
    const timezone = 'UTC'

    beforeEach(() => {
        CommentHighlightsCarouselMock.mockImplementation(() => (
            <div>Comment Highlights Chart</div>
        ))
        CommentHighlightCsatSentimentToggleMock.mockImplementation(() => (
            <div>Csat Sentiment Toggle</div>
        ))
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone: timezone,
            granularity: ReportingGranularity.Day,
        })
        useCommentHighlightsMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: [
                {
                    ticketId: '1',
                    surveyScore: '5',
                    comment: 'Great service',
                    assignedAgent: {
                        name: 'John Doe',
                        url: 'http://image.url',
                    },
                    customerName: 'Customer A',
                    assignedTeam: { name: 'Team A', emoji: '🚀' },
                },
            ],
        })
        useAppSelectorMock.mockReturnValue(CsatSentiment.Positive)
    })

    it('should render CommentHighlightsChart', () => {
        renderComponent()

        expect(screen.getByText('Comment Highlights Chart')).toBeInTheDocument()
        expect(screen.getByText('info')).toBeInTheDocument()
        expect(screen.getByText('Csat Sentiment Toggle')).toBeInTheDocument()
        expect(CommentHighlightsCarouselMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: [
                    {
                        ticketId: '1',
                        surveyScore: '5',
                        comment: 'Great service',
                        assignedAgent: {
                            name: 'John Doe',
                            url: 'http://image.url',
                        },
                        customerName: 'Customer A',
                        assignedTeam: { name: 'Team A', emoji: '🚀' },
                    },
                ],
            }),
            {},
        )
    })
})
