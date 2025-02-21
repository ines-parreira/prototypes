import {render, screen} from '@testing-library/react'
import moment from 'moment'
import React from 'react'

import {useScoredSurveys} from 'hooks/reporting/quality-management/satisfaction/useScoredSurveys'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {ReportingGranularity} from 'models/reporting/types'
import {LegacyStatsFilters} from 'models/stat/types'
import {NumberedPagination} from 'pages/common/components/Paginations'
import ScoredSurveysChart from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysChart'
import ScoredSurveysTable from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysTable'
import {formatReportingQueryDate} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/quality-management/satisfaction/useScoredSurveys')
const useScoredSurveysMock = assumeMock(useScoredSurveys)

jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)

jest.mock('pages/common/components/Paginations')
const NumberedPaginationMock = assumeMock(NumberedPagination)

jest.mock(
    'pages/stats/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysTable'
)
const ScoredSurveysTableMock = assumeMock(ScoredSurveysTable)

const periodStart = formatReportingQueryDate(moment())
const periodEnd = formatReportingQueryDate(moment().subtract(7, 'd'))
const statsFilters: LegacyStatsFilters = {
    period: {
        start_datetime: periodStart,
        end_datetime: periodEnd,
    },
}
const timezone = 'UTC'

const renderComponent = () => {
    render(<ScoredSurveysChart />)
}

describe('<CommentHighlightsChart/>', () => {
    beforeEach(() => {
        ScoredSurveysTableMock.mockImplementation(() => (
            <div>Scored Surveys Table</div>
        ))
        NumberedPaginationMock.mockImplementation(() => <div>Pagination</div>)

        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone: timezone,
            granularity: ReportingGranularity.Day,
            isAnalyticsNewFilters: true,
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
            {}
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
            screen.getByText('Try adjusting filters to get results.')
        ).toBeInTheDocument()
    })

    it('should render pagination when there is more than 10 data items', () => {
        useScoredSurveysMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: Array.from({length: 20}, () => ({
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
