import {screen} from '@testing-library/dom'
import {render} from '@testing-library/react'
import React from 'react'

import {DecreaseInFirstResponseTimeMetric} from '../DecreaseInFirstResponseTimeMetric'
import {DECREASE_IN_FIRST_RESPONSE} from '../constants'

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
        value: 5210,
        prevValue: 0,
    },
}

describe('DecreaseInFirstResponseTimeMetric', () => {
    it('should render correctly', () => {
        render(<DecreaseInFirstResponseTimeMetric trend={trend} />)

        expect(screen.getByText(DECREASE_IN_FIRST_RESPONSE)).toBeInTheDocument()
    })

    it('should render the correct value', () => {
        render(<DecreaseInFirstResponseTimeMetric trend={trend} />)

        expect(screen.getByText('1h 26m')).toBeInTheDocument()
    })

    it('should render a loading state', () => {
        render(
            <DecreaseInFirstResponseTimeMetric
                trend={{...trend, isFetching: true}}
            />
        )

        expect(screen.queryByText('1h 26m')).not.toBeInTheDocument()
    })
})
