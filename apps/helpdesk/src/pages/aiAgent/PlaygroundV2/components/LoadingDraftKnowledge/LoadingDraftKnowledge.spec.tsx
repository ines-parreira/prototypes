import { render, screen } from '@testing-library/react'

import { LoadingDraftKnowledge } from './LoadingDraftKnowledge'

describe('LoadingDraftKnowledge', () => {
    it('should render with default title and subtitle', () => {
        render(<LoadingDraftKnowledge />)

        expect(
            screen.getByText('Preview customer experience'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Ask questions like a customer would and see exactly how AI Agent responds. Use this to fine-tune knowledge, tone, and accuracy.',
            ),
        ).toBeInTheDocument()
    })

    it('should render with custom title', () => {
        render(<LoadingDraftKnowledge title="Custom Title" />)

        expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('should render with custom subtitle', () => {
        render(<LoadingDraftKnowledge subtitle="Custom Subtitle" />)

        expect(screen.getByText('Custom Subtitle')).toBeInTheDocument()
    })

    it('should render with both custom title and subtitle', () => {
        render(
            <LoadingDraftKnowledge
                title="Custom Title"
                subtitle="Custom Subtitle"
            />,
        )

        expect(screen.getByText('Custom Title')).toBeInTheDocument()
        expect(screen.getByText('Custom Subtitle')).toBeInTheDocument()
    })

    it('should render with proper accessibility attributes', () => {
        render(<LoadingDraftKnowledge />)

        const status = screen.getByRole('status')
        expect(status).toBeInTheDocument()
        expect(status).toHaveAttribute('aria-live', 'polite')
    })
})
