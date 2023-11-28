import {screen} from '@testing-library/dom'
import {render} from '@testing-library/react'
import React from 'react'
import {AutomationRateMetric} from '../AutomationRateMetric'
import {AUTOMATION_RATE_LABEL} from '../constants'

export type MetricTrend = {
    isFetching: boolean
    isError: boolean
    data?: {
        value: number | null
        prevValue: number | null
    }
}

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
        render(<AutomationRateMetric trend={{...trend, isFetching: true}} />)

        expect(screen.queryByText('300%')).not.toBeInTheDocument()
    })
})
