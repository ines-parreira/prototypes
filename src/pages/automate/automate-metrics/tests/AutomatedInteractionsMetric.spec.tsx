import {screen} from '@testing-library/dom'
import {render} from '@testing-library/react'
import React from 'react'
import {AutomatedInteractionsMetric} from '../AutomatedInteractionsMetric'
import {AUTOMATED_INTERACTIONS_LABEL} from '../constants'

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
        value: 1,
        prevValue: 0,
    },
}

describe('AutomatedInteractionsMetric', () => {
    it('should render correctly', () => {
        render(<AutomatedInteractionsMetric trend={trend} />)

        expect(
            screen.getByText(AUTOMATED_INTERACTIONS_LABEL)
        ).toBeInTheDocument()
    })

    it('should render the correct value', () => {
        render(<AutomatedInteractionsMetric trend={trend} />)

        expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should render a loading state', () => {
        render(
            <AutomatedInteractionsMetric trend={{...trend, isFetching: true}} />
        )

        expect(screen.queryByText('1')).not.toBeInTheDocument()
    })
})
