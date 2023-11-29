import React from 'react'
import {render, screen} from '@testing-library/react'

import ChartCard from '../ChartCard'

describe('<ChartCard />', () => {
    it('should render the chart card', () => {
        const title = 'Metric title'

        render(
            <ChartCard hint="metric hint" title={title}>
                Metric
            </ChartCard>
        )

        expect(screen.getByText(title)).toBeInTheDocument()
    })
})
