import { fireEvent, render, screen } from '@testing-library/react'

import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import KnowledgeSourcePreview from '../KnowledgeSourcePreview'

jest.mock('hooks/useGetDateAndTimeFormat', () => () => 'MM/dd/yyyy')

jest.mock('utils', () => ({
    formatDatetime: (date: string, format: string) =>
        `formatted-${date}-${format}`,
}))

jest.mock('utils/html', () => ({
    sanitizeHtmlDefault: (html: string) => html,
}))

describe('KnowledgeSourcePreview', () => {
    const mockOnClose = jest.fn()

    const defaultProps = {
        onClose: mockOnClose,
        title: 'Test Title',
        content: '<p>This is a test content.</p>',
        url: 'https://example.com',
        type: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
        lastUpdatedAt: '2023-10-10T12:00:00Z',
    }

    it('renders title and content', () => {
        render(<KnowledgeSourcePreview {...defaultProps} />)

        expect(screen.getByText('Test Title')).toBeInTheDocument()
        expect(screen.getByText('This is a test content.')).toBeInTheDocument()
    })

    it('renders last updated date', () => {
        render(<KnowledgeSourcePreview {...defaultProps} />)

        expect(
            screen.getByText(
                /Last updated: formatted-2023-10-10T12:00:00Z-MM\/dd\/yyyy/,
            ),
        ).toBeInTheDocument()
    })

    it('renders external link button', () => {
        render(<KnowledgeSourcePreview {...defaultProps} />)

        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('href', 'https://example.com')
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('calls onClose when close button is clicked', () => {
        render(<KnowledgeSourcePreview {...defaultProps} />)

        const closeButton = screen.getByText('keyboard_tab')
        fireEvent.click(closeButton)

        expect(mockOnClose).toHaveBeenCalled()
    })
})
