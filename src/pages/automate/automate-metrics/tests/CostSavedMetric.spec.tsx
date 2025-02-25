import React from 'react'

import { screen } from '@testing-library/dom'
import { render } from '@testing-library/react'

import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { COST_SAVED } from 'pages/automate/automate-metrics/constants'
import { CostSavedMetric } from 'pages/automate/automate-metrics/CostSavedMetric'

const trend: MetricTrend = {
    isFetching: false,
    isError: false,
    data: {
        value: 300,
        prevValue: 0,
    },
}

describe('CostSavedMetric', () => {
    it('should render correctly', () => {
        render(<CostSavedMetric trend={trend} />)

        expect(screen.getByText(COST_SAVED)).toBeInTheDocument()
    })

    it('should render the correct value', () => {
        render(<CostSavedMetric trend={trend} />)

        expect(screen.getByText('$300')).toBeInTheDocument()
    })

    it('should render a loading state', () => {
        render(<CostSavedMetric trend={{ ...trend, isFetching: true }} />)

        expect(screen.queryByText('$300')).not.toBeInTheDocument()
    })
})
