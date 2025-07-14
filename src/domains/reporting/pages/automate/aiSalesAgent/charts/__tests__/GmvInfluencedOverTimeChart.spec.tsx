import { render, screen } from '@testing-library/react'
import { TooltipItem } from 'chart.js'
import { fromJS } from 'immutable'
import moment from 'moment/moment'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import GmvInfluencedOverTimeChart, {
    formatLabelValue,
    renderTooltipLabel,
} from 'domains/reporting/pages/automate/aiSalesAgent/charts/GmvInfluencedOverTimeChart'
import { WarningBannerProvider } from 'domains/reporting/pages/automate/aiSalesAgent/components/WarningBannerProvider'
import { useGmvInfluenceOverTimeSeries } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluenceOverTimeSeries'
import LineChart from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { RootState } from 'state/types'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/hooks/timeSeries')
jest.mock(
    'domains/reporting/pages/common/components/charts/LineChart/LineChart',
)
const LineChartMock = assumeMock(LineChart)
LineChartMock.mockImplementation(() => <div>line-chart</div>)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluenceOverTimeSeries',
)
const useGmvInfluenceOverTimeSeriesMock = assumeMock(
    useGmvInfluenceOverTimeSeries,
)

const store = createStore((state) => state as RootState, {
    integrations: fromJS({
        integrations: [],
    }),
})

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
        const expectedLabel = 'Dataset Label:  $0.1'

        const result = renderTooltipLabel(true)(tooltipItem)

        expect(result).toEqual(expectedLabel)
    })

    test('renders tooltip label with no dataset label', () => {
        const tooltipItem = {
            raw: 0.1,
            dataset: { label: undefined },
        } as TooltipItem<'line'>
        const expectedLabel = ':  $0.1'

        const result = renderTooltipLabel(true)(tooltipItem)

        expect(result).toEqual(expectedLabel)
    })
})

describe('formatLabelValue', () => {
    it('should correctly format numbers as float', () => {
        const input = 0.1234
        const expectedOutput = '$0.12'
        const result = formatLabelValue(input)
        expect(result).toBe(expectedOutput)
    })

    it('should round numbers to two decimal places', () => {
        const input = 0.129
        const expectedOutput = '$0.13'
        const result = formatLabelValue(input)
        expect(result).toBe(expectedOutput)
    })

    it('should leave strings unchanged', () => {
        const input = 'Not a number'
        const result = formatLabelValue(input)
        expect(result).toBe(input)
    })

    describe('when currency is not USD', () => {
        it('should correctly format numbers as float', () => {
            const currency = 'EUR'
            const input = 0.1234
            const expectedOutput = '€0.12'
            const result = formatLabelValue(input, currency)
            expect(result).toBe(expectedOutput)
        })
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
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone,
            granularity,
        })

        useGmvInfluenceOverTimeSeriesMock.mockReturnValue({
            data: [],
            isFetching: false,
            isError: false,
        })
    })

    it('renders', () => {
        render(
            <Provider store={store}>
                <GmvInfluencedOverTimeChart />
            </Provider>,
        )

        expect(screen.getByText('GMV influenced over time')).toBeInTheDocument()
    })

    it('should use valid hook when banner is not visible', () => {
        render(
            <Provider store={store}>
                <WarningBannerProvider isBannerVisible={false}>
                    <GmvInfluencedOverTimeChart />
                </WarningBannerProvider>
            </Provider>,
        )

        expect(useGmvInfluenceOverTimeSeriesMock).toHaveBeenCalled()
    })

    it('should not use valid hook when banner is visible', () => {
        render(
            <Provider store={store}>
                <WarningBannerProvider isBannerVisible>
                    <GmvInfluencedOverTimeChart />
                </WarningBannerProvider>
            </Provider>,
        )

        expect(useGmvInfluenceOverTimeSeriesMock).not.toHaveBeenCalled()
    })
})
