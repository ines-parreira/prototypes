import { fireEvent, render, screen } from '@testing-library/react'

import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { assumeMock } from 'utils/testing'

import KnowledgeSourcePreview from '../KnowledgeSourcePreview'

jest.mock('hooks/useGetDateAndTimeFormat', () => () => 'MM/dd/yyyy')

jest.mock('utils', () => ({
    formatDatetime: (date: string, format: string) =>
        `formatted-${date}-${format}`,
}))

jest.mock('utils/html', () => ({
    sanitizeHtmlDefault: (html: string) => html,
    unescapeAmpAndDollarEntities: (html: string) => html,
}))

jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
)
const useGetGuidancesAvailableActionsMocked = assumeMock(
    useGetGuidancesAvailableActions,
)

describe('KnowledgeSourcePreview', () => {
    const mockOnClose = jest.fn()

    const defaultProps = {
        onClose: mockOnClose,
        title: 'Test Title',
        content: '<p>This is a test content.</p>',
        url: 'https://example.com',
        knowledgeResourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
        lastUpdatedAt: '2023-10-10T12:00:00Z',
        shopName: 'test-shop',
        shopType: 'test-type',
    }

    beforeEach(() => {
        useGetGuidancesAvailableActionsMocked.mockReturnValue({
            guidanceActions: [],
            isLoading: false,
        })
    })

    it('renders title and content', () => {
        render(<KnowledgeSourcePreview {...defaultProps} />)

        expect(screen.getByText('Test Title')).toBeInTheDocument()
        expect(
            screen.getByText('<p>This is a test content.</p>'),
        ).toBeInTheDocument()
    })

    it('renders knowledge type', () => {
        const { rerender } = render(
            <KnowledgeSourcePreview
                {...defaultProps}
                knowledgeResourceType={
                    AiAgentKnowledgeResourceTypeEnum.GUIDANCE
                }
            />,
        )

        expect(screen.getByText('Guidance')).toBeInTheDocument()

        rerender(
            <KnowledgeSourcePreview
                {...defaultProps}
                knowledgeResourceType={AiAgentKnowledgeResourceTypeEnum.ARTICLE}
            />,
        )

        expect(screen.getByText('Help Center article')).toBeInTheDocument()

        rerender(
            <KnowledgeSourcePreview
                {...defaultProps}
                knowledgeResourceType={'unkonwn' as any}
            />,
        )

        expect(screen.queryByText('Guidance')).not.toBeInTheDocument()
        expect(
            screen.queryByText('Help Center article'),
        ).not.toBeInTheDocument()
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

    it('calls onEdit when edit button is clicked', () => {
        const mockOnEdit = jest.fn()
        render(<KnowledgeSourcePreview {...defaultProps} onEdit={mockOnEdit} />)

        const editButton = screen.getByText('edit')
        fireEvent.click(editButton)

        expect(mockOnEdit).toHaveBeenCalled()
    })
})
