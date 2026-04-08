import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { DrillDownSidePanel } from './DrillDownSidePanel'

describe('DrillDownSidePanel', () => {
    const onClose = vi.fn()

    const defaultProps = {
        isOpen: true,
        onClose,
        title: 'Return orders',
    }

    const renderComponent = (props = {}) => {
        return render(<DrillDownSidePanel {...defaultProps} {...props} />)
    }

    it('should render title', () => {
        renderComponent()

        expect(screen.getByText('Return orders')).toBeInTheDocument()
    })

    it('should render description when provided', () => {
        renderComponent({
            description: 'Top Products with most issues and return requests.',
        })

        expect(
            screen.getByText(
                'Top Products with most issues and return requests.',
            ),
        ).toBeInTheDocument()
    })

    it('should render item count when provided', () => {
        renderComponent({ itemCount: 12 })

        expect(screen.getByText('12 items')).toBeInTheDocument()
    })

    it('should not render item count when not provided', () => {
        renderComponent()

        expect(screen.queryByText(/\d+ items/)).not.toBeInTheDocument()
    })

    it('should render children', () => {
        renderComponent({ children: <div>Table content</div> })

        expect(screen.getByText('Table content')).toBeInTheDocument()
    })

    it('should render learning resources link when learnMoreHref is provided', () => {
        renderComponent({ learnMoreHref: 'https://example.com' })

        const link = screen.getByRole('link', { name: /learning resources/i })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', 'https://example.com')
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noreferrer')
    })

    it('should not render learning resources link when learnMoreHref is not provided', () => {
        renderComponent()

        expect(
            screen.queryByRole('link', { name: /learning resources/i }),
        ).not.toBeInTheDocument()
    })

    it('should not render content when closed', () => {
        renderComponent({ isOpen: false })

        expect(screen.queryByText('Return orders')).not.toBeInTheDocument()
    })

    it('should render title alongside learning resources link', () => {
        renderComponent({ learnMoreHref: 'https://example.com' })

        expect(screen.getByText('Return orders')).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /learning resources/i }),
        ).toBeInTheDocument()
    })
})
