import React from 'react'
import {render} from '@testing-library/react'

import ChartCard from '../ChartCard'

describe('<ChartCard />', () => {
    it('should render the chart card', () => {
        const {container} = render(
            <ChartCard hint="metric hint" title="Metric title">
                Metric
            </ChartCard>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
