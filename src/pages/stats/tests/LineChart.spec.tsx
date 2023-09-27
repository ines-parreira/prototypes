import React from 'react'
import {render} from '@testing-library/react'

import {ticketsCreatedDataItem} from 'fixtures/chart'

import LineChart from '../LineChart'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid="skeleton" />
))

describe('<LineChart />', () => {
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
})
