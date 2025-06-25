import { fireEvent, render, waitFor } from '@testing-library/react'
import * as chartjs from 'chart.js'

import colors from '@gorgias/design-tokens/tokens/colors'

import { ThemeProvider } from 'core/theme'
import { ticketsCreatedDataItem } from 'fixtures/chart'
import BarChart, {
    BAR_BORDER_RADIUS,
    BarChart as BarChartWithoutTheme,
    CHART_TOOLTIP_TARGET,
    getBorderRadius,
} from 'pages/stats/common/components/charts/BarChart/BarChart'
import { useCustomTooltip } from 'pages/stats/common/useCustomTooltip'
import { assumeMock } from 'utils/testing'

jest.mock(
    '@gorgias/merchant-ui-kit',
    () =>
        ({
            ...jest.requireActual('@gorgias/merchant-ui-kit'),
            Skeleton: () => <div data-testid="skeleton" />,
        }) as typeof import('@gorgias/merchant-ui-kit'),
)
jest.mock('pages/stats/common/useCustomTooltip')
const useCustomTooltipMock = assumeMock(useCustomTooltip)
const chartSpy = jest.spyOn(chartjs, 'Chart')

describe('<BarChart />', () => {
    useCustomTooltipMock.mockReturnValue({
        customTooltip: jest.fn(),
        tooltipData: { dataPoints: [] },
        tooltipStyle: {},
    } as any)

    it('should render the loading skeleton', () => {
        const { getAllByTestId } = render(
            <BarChart data={[ticketsCreatedDataItem]} isLoading />,
        )

        expect(getAllByTestId('skeleton')).toHaveLength(1)
    })

    it('should render the legend', () => {
        render(<BarChart data={[ticketsCreatedDataItem]} displayLegend />)

        expect(document.querySelector('.legend')).toBeInTheDocument()
    })

    it('should render the interactive legend', () => {
        const { getAllByRole, getByLabelText } = render(
            <BarChart
                data={[ticketsCreatedDataItem]}
                displayLegend
                toggleLegend
            />,
        )

        expect(getByLabelText(ticketsCreatedDataItem.label)).toBeInTheDocument()
        expect(getAllByRole('checkbox').length).toBe(1)
    })

    it('should render the interactive legend with default dataset visibility', () => {
        const { queryByRole } = render(
            <BarChart
                data={[ticketsCreatedDataItem]}
                displayLegend
                toggleLegend
                defaultDatasetVisibility={{ 0: false }}
            />,
        )

        expect(queryByRole('checkbox')).not.toBeChecked()
    })

    it('should change dataset visibility on clicking legend checkbox', () => {
        const { getByRole } = render(
            <BarChart
                data={[ticketsCreatedDataItem]}
                displayLegend
                toggleLegend
            />,
        )

        const checkbox = getByRole('checkbox') as HTMLInputElement

        expect(checkbox.checked).toBeFalsy()
        fireEvent.click(checkbox)
        expect(checkbox.checked).toBeTruthy()
    })

    it('should render the line chart tooltip', async () => {
        const { queryByRole, getByTestId } = render(
            <>
                <span
                    id={CHART_TOOLTIP_TARGET}
                    data-testid={CHART_TOOLTIP_TARGET}
                />
                <BarChart data={[ticketsCreatedDataItem]} />
            </>,
        )

        fireEvent.mouseOver(getByTestId(CHART_TOOLTIP_TARGET))

        await waitFor(() => {
            expect(queryByRole('tooltip')).toBeInTheDocument()
        })
    })

    it('should not render the line chart tooltip', () => {
        const { queryByRole } = render(
            <BarChart data={[ticketsCreatedDataItem]} _displayLegacyTooltip />,
        )

        expect(queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('should render chart grid with analytics theme wrapped colors', () => {
        render(<BarChartWithoutTheme data={[]} />)

        const lastCall = chartSpy.mock.lastCall?.[1]
        const color = lastCall?.options?.scales?.y?.grid?.color as (
            ctx: unknown,
        ) => undefined

        expect(color({ tick: { value: 0 } })).toEqual(
            colors.classic.main.primary.value,
        )

        expect(color({ tick: { value: 1 } })).toEqual(
            colors.classic.neutral.grey_2.value,
        )
    })

    it('should render chart grid with theme wrapped colors', () => {
        render(
            <ThemeProvider>
                <BarChartWithoutTheme data={[]} />
            </ThemeProvider>,
        )

        const lastCall = chartSpy.mock.lastCall?.[1]
        const color = lastCall?.options?.scales?.y?.grid?.color as (
            ctx: unknown,
        ) => undefined

        expect(color({ tick: { value: 0 } })).toEqual(
            colors.classic.main.primary.value,
        )

        expect(color({ tick: { value: 1 } })).toEqual(
            colors.classic.neutral.grey_2.value,
        )
    })

    it('should not render chart tooltip title callback', () => {
        render(
            <ThemeProvider>
                <BarChart data={[ticketsCreatedDataItem]} />
            </ThemeProvider>,
        )

        const lastCall = chartSpy.mock.lastCall?.[1]
        const callbacksTitle = lastCall?.options?.plugins?.tooltip?.callbacks
            ?.title as chartjs.TooltipCallbacks<
            keyof chartjs.ChartTypeRegistry,
            unknown,
            unknown
        >['title']

        expect(callbacksTitle([])).toBeUndefined()
    })

    describe('getBorderRadius', () => {
        const createContext = ({
            datasetIndex,
            dataIndex,
            datasets,
            isHidden = false,
        }: {
            datasetIndex: number
            dataIndex: number
            datasets: any[]
            isHidden?: boolean
        }) =>
            ({
                datasetIndex,
                dataIndex,
                chart: {
                    getDatasetMeta: () => ({ hidden: isHidden }),
                    data: { datasets },
                },
            }) as any

        const withBorderRadius = {
            topLeft: BAR_BORDER_RADIUS,
            topRight: BAR_BORDER_RADIUS,
            bottomLeft: 0,
            bottomRight: 0,
        }

        it('returns `0` when datasets array is empty', () => {
            const context = createContext({
                datasetIndex: 0,
                dataIndex: 0,
                datasets: [],
            })
            const actual = getBorderRadius(context)

            expect(actual).toBe(0)
        })

        it('returns `0` when datasetIndex is not the top index', () => {
            const datasets = [
                { data: [10, 20, 30] },
                { data: [15, 25, 35] },
                { data: [20, 30, 40] },
            ]
            const context = createContext({
                datasetIndex: 0,
                dataIndex: 1,
                datasets,
            })

            const actual = getBorderRadius(context)

            expect(actual).toBe(0)
        })

        it('returns `0` when topDataset data value is 0', () => {
            const datasets = [{ data: [10, 20, 30] }, { data: [15, 0, 35] }]
            const context = createContext({
                datasetIndex: 1,
                dataIndex: 1,
                datasets,
            })

            const actual = getBorderRadius(context)

            expect(actual).toBe(0)
        })

        it('returns `0` when dataset is hidden', () => {
            const datasets = [{ data: [10, 20, 30] }, { data: [15, 25, 35] }]
            const context = createContext({
                datasetIndex: 1,
                dataIndex: 1,
                datasets,
                isHidden: true,
            })

            const actual = getBorderRadius(context)

            expect(actual).toBe(0)
        })

        it('returns border radius object when all conditions are met', () => {
            const datasets = [{ data: [10, 20, 30] }, { data: [15, 25, 35] }]
            const context = createContext({
                datasetIndex: 1,
                dataIndex: 1,
                datasets,
            })

            const actual = getBorderRadius(context)

            expect(actual).toEqual(withBorderRadius)
        })

        it('returns border radius object for single dataset with non-zero data', () => {
            const datasets = [{ data: [15, 25, 35] }]
            const context = createContext({
                datasetIndex: 0,
                dataIndex: 1,
                datasets,
            })

            const actual = getBorderRadius(context)

            expect(actual).toEqual(withBorderRadius)
        })

        it('returns `0` for single dataset with zero data', () => {
            const datasets = [{ data: [0, 25, 35] }]
            const context = createContext({
                datasetIndex: 0,
                dataIndex: 0,
                datasets,
            })

            const actual = getBorderRadius(context)

            expect(actual).toBe(0)
        })

        it('handles undefined data gracefully', () => {
            const datasets = [
                { data: [10, 20, 30] },
                { data: [15, undefined, 35] },
            ]
            const context = createContext({
                datasetIndex: 1,
                dataIndex: 1,
                datasets,
            })

            const actual = getBorderRadius(context)

            expect(actual).toEqual(withBorderRadius)
        })
    })
})
