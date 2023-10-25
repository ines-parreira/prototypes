import React from 'react'
import {render, waitFor, fireEvent} from '@testing-library/react'

import {ticketsCreatedDataItem} from 'fixtures/chart'
import {assumeMock} from 'utils/testing'

import LineChart, {CHART_TOOLTIP_TARGET} from '../LineChart'
import {useCustomTooltip} from '../useCustomTooltip'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid="skeleton" />
))
jest.mock('pages/stats/useCustomTooltip')
const useCustomTooltipMock = assumeMock(useCustomTooltip)

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
})
