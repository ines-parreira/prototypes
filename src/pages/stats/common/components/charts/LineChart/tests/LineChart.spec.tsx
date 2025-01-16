import colors from '@gorgias/design-tokens/dist/tokens/colors.json'
import {render, waitFor, fireEvent} from '@testing-library/react'
import * as chartjs from 'chart.js'
import React from 'react'

import {ThemeProvider} from 'core/theme'
import {ticketsCreatedDataItem} from 'fixtures/chart'
import {useCustomTooltip} from 'pages/stats/common/useCustomTooltip'
import {assumeMock} from 'utils/testing'

import LineChart, {
    CHART_TOOLTIP_TARGET,
    LineChart as LineChartWithoutTheme,
} from '../LineChart'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid="skeleton" />
))
jest.mock('pages/stats/common/useCustomTooltip')
const useCustomTooltipMock = assumeMock(useCustomTooltip)
const chartSpy = jest.spyOn(chartjs, 'Chart')

describe('<LineChart />', () => {
    useCustomTooltipMock.mockReturnValue({
        customTooltip: jest.fn(),
        tooltipData: {dataPoints: []},
        tooltipStyle: {},
    } as any)

    it('should render the line chart', () => {
        const {container} = render(
            <LineChart data={[ticketsCreatedDataItem]} />
        )

        expect(container).toMatchSnapshot()
    })

    it('should render the loading skeleton', () => {
        const {getAllByTestId} = render(
            <LineChart data={[ticketsCreatedDataItem]} isLoading />
        )

        expect(getAllByTestId('skeleton')).toHaveLength(1)
    })

    it('should render the legend', () => {
        render(<LineChart data={[ticketsCreatedDataItem]} displayLegend />)

        expect(document.querySelector('.legend')).toBeInTheDocument()
    })

    it('should render the interactive legend', () => {
        const {getAllByRole, getByLabelText} = render(
            <LineChart
                data={[ticketsCreatedDataItem]}
                displayLegend
                toggleLegend
            />
        )

        expect(getByLabelText(ticketsCreatedDataItem.label)).toBeInTheDocument()
        expect(getAllByRole('checkbox').length).toBe(1)
    })

    it('should render the interactive legend with default dataset visibility', () => {
        const {queryByRole} = render(
            <LineChart
                data={[ticketsCreatedDataItem]}
                displayLegend
                toggleLegend
                defaultDatasetVisibility={{0: false}}
            />
        )

        expect(queryByRole('checkbox')).not.toBeChecked()
    })

    // Needs investigation, Linear: https://linear.app/gorgias/issue/PLTDA-2219/test-is-failing-due-to-chart-re-rendering-issue
    it.skip('should change dataset visibility on clicking legend checkbox', () => {
        const {getByRole} = render(
            <LineChart
                data={[ticketsCreatedDataItem]}
                displayLegend
                toggleLegend
            />
        )

        const checkbox = getByRole('checkbox') as HTMLInputElement

        expect(checkbox.checked).toBeFalsy()
        fireEvent.click(checkbox)
        expect(checkbox.checked).toBeTruthy()
    })

    it('should render the line chart tooltip', async () => {
        const {queryByRole, getByTestId} = render(
            <>
                <span
                    id={CHART_TOOLTIP_TARGET}
                    data-testid={CHART_TOOLTIP_TARGET}
                />
                <LineChart data={[ticketsCreatedDataItem]} />
            </>
        )

        fireEvent.mouseOver(getByTestId(CHART_TOOLTIP_TARGET))

        await waitFor(() => {
            expect(queryByRole('tooltip')).toBeInTheDocument()
        })
    })

    it('should not render the line chart tooltip', () => {
        const {queryByRole} = render(
            <LineChart data={[ticketsCreatedDataItem]} _displayLegacyTooltip />
        )

        expect(queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('should render chart grid with analytics theme wrapped colors', () => {
        render(<LineChartWithoutTheme data={[]} />)

        const lastCall = chartSpy.mock.lastCall?.[1]
        const color = lastCall?.options?.scales?.y?.grid?.color as (
            ctx: unknown
        ) => undefined

        expect(color({tick: {value: 0}})).toEqual(
            colors['📺 Classic'].Main.Primary.value
        )

        expect(color({tick: {value: 1}})).toEqual(
            colors['📺 Classic'].Neutral.Grey_2.value
        )
    })

    it('should render chart grid with theme wrapped colors', () => {
        render(
            <ThemeProvider>
                <LineChartWithoutTheme data={[]} />
            </ThemeProvider>
        )

        const lastCall = chartSpy.mock.lastCall?.[1]
        const color = lastCall?.options?.scales?.y?.grid?.color as (
            ctx: unknown
        ) => undefined

        expect(color({tick: {value: 0}})).toEqual(
            colors['📺 Classic'].Main.Primary.value
        )

        expect(color({tick: {value: 1}})).toEqual(
            colors['📺 Classic'].Neutral.Grey_2.value
        )
    })

    it('should not render chart tooltip title callback', () => {
        render(<LineChart data={[ticketsCreatedDataItem]} />)

        const lastCall = chartSpy.mock.lastCall?.[1]
        const callbacksTitle = lastCall?.options?.plugins?.tooltip?.callbacks
            ?.title as chartjs.TooltipCallbacks<
            keyof chartjs.ChartTypeRegistry,
            unknown,
            unknown
        >['title']

        expect(callbacksTitle([])).toBeUndefined()
    })

    it('should call the resize callback', async () => {
        render(<LineChart data={[ticketsCreatedDataItem]} />)

        const lastCall = chartSpy.mock.lastCall?.[1]
        const onResizeCallback = lastCall?.options?.onResize

        await waitFor(() => {
            expect(onResizeCallback).toBeDefined()

            if (onResizeCallback) {
                expect(
                    onResizeCallback({} as chartjs.Chart, {
                        width: 200,
                        height: 100,
                    })
                ).toBeUndefined()
            }
        })
    })
})
