import React from 'react'

import { render, screen } from '@testing-library/react'
import moment from 'moment'

import { useScoredSurveys } from 'hooks/reporting/quality-management/satisfaction/useScoredSurveys'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { NumberedPagination } from 'pages/common/components/Paginations'
import { NO_DATA_AVAILABLE_COMPONENT_TEXT } from 'pages/stats/common/components/NoDataAvailable'
import ScoredSurveysChart from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysChart'
import ScoredSurveysTable from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysTable'
import { formatReportingQueryDate } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/quality-management/satisfaction/useScoredSurveys')
const useScoredSurveysMock = assumeMock(useScoredSurveys)

jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('pages/common/components/Paginations')
const NumberedPaginationMock = assumeMock(NumberedPagination)

jest.mock(
    'pages/stats/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysTable',
)
const ScoredSurveysTableMock = assumeMock(ScoredSurveysTable)

const renderComponent = () => {
    render(<ScoredSurveysChart />)
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
        ScoredSurveysTableMock.mockImplementation(() => (
            <div>Scored Surveys Table</div>
        ))
        NumberedPaginationMock.mockImplementation(() => <div>Pagination</div>)

        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone: timezone,
            granularity: ReportingGranularity.Day,
        })

        useScoredSurveysMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: [
                {
                    ticketId: '1',
                    surveyScore: '5',
                    comment: 'Great service',
                    assignee: 'John Doe',
                    customerName: 'Customer A',
                    surveyScoredDate: '',
                    surveyCustomerId: '2',
                },
            ],
        })
    })

    it('should render ScoredSurveysChart', () => {
        renderComponent()

        expect(screen.getByText('Scored Surveys Table')).toBeInTheDocument()
        expect(screen.getByText('Scored surveys')).toBeInTheDocument()
        expect(ScoredSurveysTableMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: [
                    {
                        ticketId: '1',
                        surveyScore: '5',
                        comment: 'Great service',
                        assignee: 'John Doe',
                        customerName: 'Customer A',
                        surveyScoredDate: '',
                        surveyCustomerId: '2',
                    },
                ],
            }),
            {},
        )
    })

    it('should render No data available when not loading and data array is empty', () => {
        useScoredSurveysMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: [],
        })

        renderComponent()

        expect(screen.getByText('No data available')).toBeInTheDocument()
        expect(
            screen.getByText(NO_DATA_AVAILABLE_COMPONENT_TEXT),
        ).toBeInTheDocument()
    })

    it('should render pagination when there is more than 10 data items', () => {
        useScoredSurveysMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: Array.from({ length: 20 }, () => ({
                ticketId: '1',
                surveyScore: '5',
                comment: 'Great service',
                assignee: 'John Doe',
                customerName: 'Customer A',
                surveyScoredDate: '',
                surveyCustomerId: '2',
            })),
        })

        renderComponent()

        expect(screen.getByText('Scored Surveys Table')).toBeInTheDocument()
        expect(screen.getByText('Scored surveys')).toBeInTheDocument()
        expect(screen.getByText('Pagination')).toBeInTheDocument()
    })
})
