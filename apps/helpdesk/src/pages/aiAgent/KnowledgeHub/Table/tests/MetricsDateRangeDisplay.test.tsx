import { render } from '@repo/testing'

import '@testing-library/jest-dom'

import { screen } from '@testing-library/react'

import { MetricsDateRangeDisplay } from '../MetricsDateRangeDisplay'

describe('MetricsDateRangeDisplay', () => {
    it('should display the correct number of days', () => {
        render(<MetricsDateRangeDisplay days={28} />)

        expect(
            screen.getByText('Metrics from last 28 days'),
        ).toBeInTheDocument()
    })
})
