import { render, screen } from '@testing-library/react'

import { DigestCard } from './DigestCard'

describe('<DigestCard />', () => {
    it.skip('renders metrics and content with correct values and variations', () => {
        const metrics = [
            { label: 'Revenue', value: '$1000', variation: '+12%' },
            { label: 'Opt-outs', value: '5', variation: '-2%' },
            { label: 'Neutral', value: '0', variation: '0%' },
        ]
        render(<DigestCard content="Metrics test" metrics={metrics} />)

        expect(screen.getByText('Revenue')).toBeInTheDocument()
        expect(screen.getByText('$1000')).toBeInTheDocument()
        expect(screen.getByText('+12%')).toBeInTheDocument()

        expect(screen.getByText('Opt-outs')).toBeInTheDocument()
        expect(screen.getByText('5')).toBeInTheDocument()
        expect(screen.getByText('-2%')).toBeInTheDocument()

        expect(screen.getByText('Neutral')).toBeInTheDocument()
        expect(screen.getByText('0')).toBeInTheDocument()
        expect(screen.getByText('0%')).toBeInTheDocument()

        expect(screen.getByText('Metrics test')).toBeInTheDocument()
    })

    it.skip('shows arrow_upward for positive and arrow_downward for negative variations and no arrow for neutral', () => {
        const metrics = [
            { label: 'Positive', value: '10', variation: '+5%' },
            { label: 'Negative', value: '2', variation: '-3%' },
            { label: 'Neutral', value: '0', variation: '0%' },
        ]
        render(<DigestCard content="Arrows" metrics={metrics} />)

        const upwardArrows = screen.getAllByText('arrow_upward')
        const downwardArrows = screen.getAllByText('arrow_downward')
        expect(upwardArrows.length).toBe(1)
        expect(downwardArrows.length).toBe(1)
    })

    it.skip('applies negative class for negative variations', () => {
        const metrics = [{ label: 'Negative', value: '2', variation: '-3%' }]
        render(<DigestCard content="Negative class" metrics={metrics} />)
        const negativeVariation = screen.getByText('-3%').parentElement
        expect(negativeVariation?.className).toMatch(
            /metricVariation--negative/,
        )
    })

    it.skip('applies neutral class for negative variations', () => {
        const metrics = [{ label: 'neutral', value: '2', variation: '0%' }]
        render(<DigestCard content="Negative class" metrics={metrics} />)
        const negativeVariation = screen.getByText('0%').parentElement
        expect(negativeVariation?.className).toMatch(/metricVariation--neutral/)
    })
})
