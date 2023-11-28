import {screen} from '@testing-library/dom'
import {render} from '@testing-library/react'
import React from 'react'
import {AutomationTimeSavedMetric} from '../AutomationTimeSavedMetric'
import {AUTOMATION_TIME_SAVED} from '../constants'

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
        value: 53,
        prevValue: 0,
    },
}

describe('AutomatedInteractionsMetric', () => {
    it('should render correctly', () => {
        render(<AutomationTimeSavedMetric trend={trend} />)

        expect(screen.getByText(AUTOMATION_TIME_SAVED)).toBeInTheDocument()
    })

    it('should render the correct value', () => {
        render(<AutomationTimeSavedMetric trend={trend} />)

        expect(screen.getByText('53s')).toBeInTheDocument()
    })

    it('should render a loading state', () => {
        render(
            <AutomationTimeSavedMetric trend={{...trend, isFetching: true}} />
        )

        expect(screen.queryByText('53s')).not.toBeInTheDocument()
    })
})
