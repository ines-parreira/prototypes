import React from 'react'

import { screen } from '@testing-library/dom'
import { render } from '@testing-library/react'

import { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { AutomatedInteractionsMetric } from 'pages/automate/automate-metrics/AutomatedInteractionsMetric'
import { AUTOMATED_INTERACTIONS_LABEL } from 'pages/automate/automate-metrics/constants'

const trend: MetricTrend = {
    isFetching: false,
    isError: false,
    data: {
        value: 1,
        prevValue: 0,
    },
}

describe('AutomatedInteractionsMetric', () => {
    it('should render correctly', () => {
        render(<AutomatedInteractionsMetric trend={trend} />)

        expect(
            screen.getByText(AUTOMATED_INTERACTIONS_LABEL),
        ).toBeInTheDocument()
    })

    it('should render the correct value', () => {
        render(<AutomatedInteractionsMetric trend={trend} />)

        expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should render a loading state', () => {
        render(
            <AutomatedInteractionsMetric
                trend={{ ...trend, isFetching: true }}
            />,
        )

        expect(screen.queryByText('1')).not.toBeInTheDocument()
    })
})
