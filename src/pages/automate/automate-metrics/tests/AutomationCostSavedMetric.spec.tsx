import {screen} from '@testing-library/dom'
import {render} from '@testing-library/react'
import React from 'react'
import {AutomationCostSavedMetric} from '../AutomationCostSavedMetric'
import {COST_SAVED} from '../constants'

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
        value: 300,
        prevValue: 0,
    },
}

describe('AutomationCostSavedMetric', () => {
    it('should render correctly', () => {
        render(<AutomationCostSavedMetric trend={trend} />)

        expect(screen.getByText(COST_SAVED)).toBeInTheDocument()
    })

    it('should render the correct value', () => {
        render(<AutomationCostSavedMetric trend={trend} />)

        expect(screen.getByText('$300')).toBeInTheDocument()
    })

    it('should render a loading state', () => {
        render(
            <AutomationCostSavedMetric trend={{...trend, isFetching: true}} />
        )

        expect(screen.queryByText('$300')).not.toBeInTheDocument()
    })
})
