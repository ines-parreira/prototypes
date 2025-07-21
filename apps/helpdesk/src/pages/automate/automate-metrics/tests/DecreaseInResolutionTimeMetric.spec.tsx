import React from 'react'

import { screen } from '@testing-library/dom'
import { render } from '@testing-library/react'

import { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { DECREASE_IN_RESOLUTION_TIME } from 'pages/automate/automate-metrics/constants'
import { DecreaseInResolutionTimeMetric } from 'pages/automate/automate-metrics/DecreaseInResolutionTimeMetric'

const trend: MetricTrend = {
    isFetching: false,
    isError: false,
    data: {
        value: 53,
        prevValue: 0,
    },
}

describe('DecreaseInResolutionTimeMetric', () => {
    it('should render correctly', () => {
        render(<DecreaseInResolutionTimeMetric trend={trend} />)

        expect(
            screen.getByText(DECREASE_IN_RESOLUTION_TIME),
        ).toBeInTheDocument()
    })

    it('should render the correct value', () => {
        render(<DecreaseInResolutionTimeMetric trend={trend} />)

        expect(screen.getByText('53s')).toBeInTheDocument()
    })

    it('should render a loading state', () => {
        render(
            <DecreaseInResolutionTimeMetric
                trend={{ ...trend, isFetching: true }}
            />,
        )

        expect(screen.queryByText('53s')).not.toBeInTheDocument()
    })
})
