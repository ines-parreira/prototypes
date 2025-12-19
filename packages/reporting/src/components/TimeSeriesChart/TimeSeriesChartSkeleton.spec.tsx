import { render } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'

import { TimeSeriesChartSkeleton } from './TimeSeriesChartSkeleton'

beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    }
})

describe('TimeSeriesChartSkeleton', () => {
    it('should render skeleton chart', () => {
        const { container } = render(
            <TimeSeriesChartSkeleton chartHeight={280} />,
        )

        expect(container.firstChild).toBeTruthy()
    })

    it('should render with custom chart height', () => {
        const { container } = render(
            <TimeSeriesChartSkeleton chartHeight={400} />,
        )

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should render skeleton with small height', () => {
        const { container } = render(
            <TimeSeriesChartSkeleton chartHeight={150} />,
        )

        expect(container.firstChild).toBeTruthy()
    })

    it('should render shimmer animation', () => {
        const { container } = render(
            <TimeSeriesChartSkeleton chartHeight={280} />,
        )

        expect(container.firstChild).toBeTruthy()
        const wrappers = container.querySelectorAll('div')
        expect(wrappers.length).toBeGreaterThan(0)
    })

    it('should render area chart with skeleton data', () => {
        const { container } = render(
            <TimeSeriesChartSkeleton chartHeight={280} />,
        )

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })
})
