import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ChartLegend } from './ChartLegend'

describe('ChartLegend', () => {
    const seriesWithColors = [
        { name: 'Series A', value: 0, color: '#800080' },
        { name: 'Series B', value: 0, color: '#FFA500' },
    ]

    it('should render series names', () => {
        render(<ChartLegend seriesWithColors={seriesWithColors} />)

        expect(screen.getByText('Series A')).toBeInTheDocument()
        expect(screen.getByText('Series B')).toBeInTheDocument()
    })
})
