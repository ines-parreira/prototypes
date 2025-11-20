import { render, screen } from '@testing-library/react'

import type { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'

import { DigestCard } from './DigestCard'

describe('<DigestCard />', () => {
    it('renders metrics and content with correct values', () => {
        const metrics: MetricProps[] = [
            {
                label: 'Revenue',
                value: 1000,
                prevValue: 250,
                interpretAs: 'more-is-better',
                metricFormat: 'currency',
                isLoading: false,
            },
            {
                label: 'Opt-outs',
                value: 5,
                prevValue: 10,
                interpretAs: 'more-is-better',
                metricFormat: 'decimal-precision-1',
                isLoading: false,
            },
            {
                label: 'Neutral',
                value: 0,
                prevValue: 0,
                interpretAs: 'more-is-better',
                metricFormat: 'decimal-precision-1',
                isLoading: false,
            },
        ]
        render(
            <DigestCard
                badgeContent="Performance Metrics"
                content="Metrics test"
                metrics={metrics}
                isLoading={false}
            />,
        )

        expect(screen.getByText('Revenue')).toBeInTheDocument()
        expect(screen.getByText('$1,000')).toBeInTheDocument()
        expect(screen.getByText('300%')).toBeInTheDocument()

        expect(screen.getByText('Opt-outs')).toBeInTheDocument()
        expect(screen.getByText('5')).toBeInTheDocument()
        expect(screen.getByText('50%')).toBeInTheDocument()

        expect(screen.getByText('Neutral')).toBeInTheDocument()
        expect(screen.getByText('0')).toBeInTheDocument()
        expect(screen.getByText('0%')).toBeInTheDocument()

        expect(screen.getByText('Metrics test')).toBeInTheDocument()
    })
})
