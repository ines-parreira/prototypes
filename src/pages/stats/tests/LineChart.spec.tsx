import React from 'react'
import {render} from '@testing-library/react'

import {TicketsCreatedDataItem} from 'fixtures/chart'
import LineChart from '../LineChart'

describe('<LineChart />', () => {
    it('should render the line chart', () => {
        const {container} = render(
            <LineChart data={[TicketsCreatedDataItem]} />
        )

        expect(container).toMatchSnapshot()
    })
})
