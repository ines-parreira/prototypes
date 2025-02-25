import React from 'react'

import { UseQueryResult } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { TooltipItem } from 'chart.js'
import moment from 'moment/moment'

import { useNewStatsFilters } from 'hooks/reporting/support-performance/useNewStatsFilters'
import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import useGmvInfluenceOverTimeSeries from 'pages/stats/aiSalesAgent/metrics/useGmvInfluenceOverTimeSeries'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import { formatReportingQueryDate } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

import GmvInfluencedOverTimeChart, {
    percentLabel,
    renderTooltipLabel,
} from '../GmvInfluencedOverTimeChart'

jest.mock('hooks/reporting/timeSeries')
jest.mock('pages/stats/common/components/charts/LineChart/LineChart')
const LineChartMock = assumeMock(LineChart)
LineChartMock.mockImplementation(() => <div>line-chart</div>)

jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)

jest.mock('pages/stats/aiSalesAgent/metrics/useGmvInfluenceOverTimeSeries')
const useGmvInfluenceOverTimeSeriesMock = assumeMock(
    useGmvInfluenceOverTimeSeries,
)

describe('renderTooltipLabel', () => {
    test('renders tooltip label without percentage', () => {
        const tooltipItem = {
            raw: 10,
            dataset: { label: 'Dataset Label' },
        } as TooltipItem<'line'>
        const expectedLabel = 'Dataset Label:  10'

        const result = renderTooltipLabel(false)(tooltipItem)

        expect(result).toEqual(expectedLabel)
    })

    test('renders tooltip label with percentage', () => {
        const tooltipItem = {
            raw: 0.1,
            dataset: { label: 'Dataset Label' },
        } as TooltipItem<'line'>
        const expectedLabel = 'Dataset Label:  10%'

        const result = renderTooltipLabel(true)(tooltipItem)

        expect(result).toEqual(expectedLabel)
    })

    test('renders tooltip label with no dataset label', () => {
        const tooltipItem = {
            raw: 0.1,
            dataset: { label: undefined },
        } as TooltipItem<'line'>
        const expectedLabel = ':  10%'

        const result = renderTooltipLabel(true)(tooltipItem)

        expect(result).toEqual(expectedLabel)
    })
})

describe('percentLabel', () => {
    it('should correctly format numbers as percentages', () => {
        const input = 0.1234
        const expectedOutput = '12.34%'
        const result = percentLabel(input)
        expect(result).toBe(expectedOutput)
    })

    it('should round percentages to two decimal places', () => {
        const input = 0.129
        const expectedOutput = '12.9%'
        const result = percentLabel(input)
        expect(result).toBe(expectedOutput)
    })

    it('should leave strings unchanged', () => {
        const input = 'Not a number'
        const result = percentLabel(input)
        expect(result).toBe(input)
    })
})

describe('<GmvInfluencedOverTimeChart />', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: periodStart,
            end_datetime: periodEnd,
        },
    }
    const userTimezone = 'UTC'
    const granularity = ReportingGranularity.Day

    beforeAll(() => {
        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone,
            granularity,
            isAnalyticsNewFilters: true,
        })

        useGmvInfluenceOverTimeSeriesMock.mockReturnValue({
            data: [],
        } as unknown as UseQueryResult<TimeSeriesDataItem[][]>)
    })

    it('renders', () => {
        render(<GmvInfluencedOverTimeChart />)

        expect(screen.getByText('GMV Influenced Over Time')).toBeInTheDocument()
    })
})
