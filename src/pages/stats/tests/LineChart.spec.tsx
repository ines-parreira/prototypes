import React from 'react'
import {render} from '@testing-library/react'

import {ticketsCreatedDataItem} from 'fixtures/chart'

import LineChart from '../LineChart'

describe('<LineChart />', () => {
    it('should render the line chart', () => {
        const {container} = render(
            <LineChart data={[ticketsCreatedDataItem]} />
        )

        expect(container).toMatchSnapshot()
    })
})
