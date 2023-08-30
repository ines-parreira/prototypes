import React from 'react'
import {render} from '@testing-library/react'

import MetricCard from '../MetricCard'

describe('<MetricCard />', () => {
    it('should render the metric card', () => {
        const {container} = render(
            <MetricCard hint={{title: 'metric hint'}} title="Metric title">
                MetricCard
            </MetricCard>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
