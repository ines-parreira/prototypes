import React from 'react'

import { screen } from '@testing-library/dom'
import { render } from '@testing-library/react'

import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { AutomationRateMetric } from 'pages/automate/automate-metrics/AutomationRateMetric'
import { AUTOMATION_RATE_LABEL } from 'pages/automate/automate-metrics/constants'

const trend: MetricTrend = {
    isFetching: false,
    isError: false,
    data: {
        value: 3,
        prevValue: 0,
    },
}

describe('AutomationRateMetric', () => {
    it('should render correctly', () => {
        render(<AutomationRateMetric trend={trend} />)

        expect(screen.getByText(AUTOMATION_RATE_LABEL)).toBeInTheDocument()
    })

    it('should render the correct value', () => {
        render(<AutomationRateMetric trend={trend} />)

        expect(screen.getByText('300%')).toBeInTheDocument()
    })

    it('should render a loading state', () => {
        render(<AutomationRateMetric trend={{ ...trend, isFetching: true }} />)

        expect(screen.queryByText('300%')).not.toBeInTheDocument()
    })
})
