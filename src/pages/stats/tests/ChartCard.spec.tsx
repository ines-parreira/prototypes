import {render, screen} from '@testing-library/react'
import React from 'react'

import ChartCard from '../ChartCard'

describe('<ChartCard />', () => {
    it('should render the chart card', () => {
        const title = 'Metric title'

        render(
            <ChartCard hint={{title: 'metric hint'}} title={title}>
                Metric
            </ChartCard>
        )

        expect(screen.getByText(title)).toBeInTheDocument()
    })
})
