import { render, screen } from '@testing-library/react'

import { KeyMetricsSection } from '../KeyMetricsSection'

describe('KeyMetricsSection', () => {
    it('should render all four metric cards', () => {
        render(<KeyMetricsSection />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
        expect(screen.getByText('Time saved by agents')).toBeInTheDocument()
        expect(screen.getByText('Cost saved')).toBeInTheDocument()
    })

    it('should render automation rate metric with correct value', () => {
        render(<KeyMetricsSection />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
        expect(screen.getByText('32%')).toBeInTheDocument()
    })

    it('should render automated interactions metric with correct value', () => {
        render(<KeyMetricsSection />)

        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
        expect(screen.getByText('4,800')).toBeInTheDocument()
    })

    it('should render time saved metric with correct value', () => {
        render(<KeyMetricsSection />)

        expect(screen.getByText('Time saved by agents')).toBeInTheDocument()
        expect(screen.getByText('5h 30m')).toBeInTheDocument()
    })

    it('should render cost saved metric with correct value', () => {
        render(<KeyMetricsSection />)

        expect(screen.getByText('Cost saved')).toBeInTheDocument()
        expect(screen.getByText('$2,400')).toBeInTheDocument()
    })

    it('should render metrics with correct trend indicators', () => {
        render(<KeyMetricsSection />)

        const twoPercentTrends = screen.getAllByText('2%')
        expect(twoPercentTrends.length).toBeGreaterThan(0)
    })
})
