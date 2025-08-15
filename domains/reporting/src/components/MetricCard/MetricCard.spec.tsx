import { render, screen } from '@testing-library/react'

import { MetricCard } from './MetricCard'

describe('MetricCard', () => {
    it('should render', () => {
        render(<MetricCard title="Test" />)

        expect(screen.getByText('Test')).toBeInTheDocument()
    })
})
