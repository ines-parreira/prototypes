import {screen} from '@testing-library/dom'
import {render} from '@testing-library/react'
import React from 'react'
import {CostSavedMetric} from '../CostSavedMetric'
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
        render(<CostSavedMetric trend={{...trend, isFetching: true}} />)

        expect(screen.queryByText('$300')).not.toBeInTheDocument()
    })
})
