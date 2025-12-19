import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TimeSeriesChartTooltip } from './TimeSeriesChartTooltip'

describe('TimeSeriesChartTooltip', () => {
    it('should render date and value', () => {
        render(<TimeSeriesChartTooltip date="Jan 1" value={100} />)

        expect(screen.getByText('Jan 1')).toBeInTheDocument()
        expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should apply custom value formatter', () => {
        const formatter = (value: number) => `$${value.toFixed(2)}`

        render(
            <TimeSeriesChartTooltip
                date="Jan 1"
                value={100}
                valueFormatter={formatter}
            />,
        )

        expect(screen.getByText('$100.00')).toBeInTheDocument()
    })

    it('should handle value formatter with percentage', () => {
        const percentageFormatter = (value: number) =>
            `${(value * 100).toFixed(1)}%`

        render(
            <TimeSeriesChartTooltip
                date="Feb 15"
                value={0.325}
                valueFormatter={percentageFormatter}
            />,
        )

        expect(screen.getByText('32.5%')).toBeInTheDocument()
    })
})
