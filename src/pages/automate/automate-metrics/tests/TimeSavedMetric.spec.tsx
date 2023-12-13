import {screen} from '@testing-library/dom'
import {render} from '@testing-library/react'
import React from 'react'
import {TimeSavedMetric} from '../TimeSavedMetric'
import {TIME_SAVED} from '../constants'

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

describe('TimeSavedMetric', () => {
    it('should render correctly', () => {
        render(<TimeSavedMetric trend={trend} />)

        expect(screen.getByText(TIME_SAVED)).toBeInTheDocument()
    })

    it('should render the correct value', () => {
        render(<TimeSavedMetric trend={trend} />)

        expect(screen.getByText('53s')).toBeInTheDocument()
    })

    it('should render a loading state', () => {
        render(<TimeSavedMetric trend={{...trend, isFetching: true}} />)

        expect(screen.queryByText('53s')).not.toBeInTheDocument()
    })
})
