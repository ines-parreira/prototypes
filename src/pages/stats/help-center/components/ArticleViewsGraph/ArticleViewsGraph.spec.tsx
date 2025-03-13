import React from 'react'

import { UseQueryResult } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { CoreScaleOptions, Scale } from 'chart.js'
import moment from 'moment'

import { useArticleViewTimeSeries } from 'hooks/reporting/help-center/useArticleViewTimeSeries'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import { ReportingGranularity } from 'models/reporting/types'
import ArticleViewsGraph, {
    renderXTickLabel,
} from 'pages/stats/help-center/components/ArticleViewsGraph/ArticleViewsGraph'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/help-center/useArticleViewTimeSeries', () => ({
    useArticleViewTimeSeries: jest.fn(),
}))
jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

const mockUseArticleViewTimeSeries = jest.mocked(useArticleViewTimeSeries)
const defaultArticleViewTimeSeriesResponse = {
    data: undefined,
    isFetching: false,
} as UseQueryResult<TimeSeriesDataItem[][]>

const renderComponent = () => {
    return render(<ArticleViewsGraph />)
}

describe('<ArticleViewsGraphComponent />', () => {
    const statsFilters = {
        period: {
            end_datetime: new Date().toString(),
            start_datetime: new Date('01/08/2023').toString(),
        },
    }

    beforeEach(() => {
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone: 'US',
            granularity: ReportingGranularity.Day,
        })
        mockUseArticleViewTimeSeries.mockClear()
        mockUseArticleViewTimeSeries.mockReturnValue(
            defaultArticleViewTimeSeriesResponse,
        )
    })
    it('should render', () => {
        renderComponent()

        expect(screen.getByText('Article views')).toBeInTheDocument()
    })

    it('should show loading state', () => {
        mockUseArticleViewTimeSeries.mockReturnValue({
            ...defaultArticleViewTimeSeriesResponse,
            isFetching: true,
        })

        renderComponent()

        expect(
            document.querySelector('.react-loading-skeleton'),
        ).toBeInTheDocument()
    })

    describe('renderXTickLabel', () => {
        it('should return valid date', () => {
            expect(
                renderXTickLabel.call(
                    {
                        getLabelForValue: () => moment('2023-10-06'),
                    } as unknown as Scale<CoreScaleOptions>,
                    '',
                    0,
                ),
            ).toEqual('Oct 6')
        })

        it('should return input when date is invalid', () => {
            expect(
                renderXTickLabel.call(
                    {
                        getLabelForValue: () => 'invalid date',
                    } as unknown as Scale<CoreScaleOptions>,
                    '',
                    0,
                ),
            ).toEqual('invalid date')
        })
    })
})
