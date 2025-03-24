import { render, screen } from '@testing-library/react'

import SummaryBlock from '../SummaryBlock'

describe('SummaryBlock', () => {
    const summaryData = {
        test: 'data',
        another: 4,
    }

    const renderComponent = (children?: React.ReactNode) =>
        render(
            <SummaryBlock summaryData={summaryData}>{children}</SummaryBlock>,
        )

    it('should render summary data correctly', () => {
        renderComponent()
        expect(screen.getByText('test:')).toBeInTheDocument()
        expect(screen.getByText('data')).toBeInTheDocument()
        expect(screen.getByText('another:')).toBeInTheDocument()
        expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('should render children correctly', () => {
        renderComponent(<div>Child Component</div>)
        expect(screen.getByText('Child Component')).toBeInTheDocument()
    })
})
