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
})
