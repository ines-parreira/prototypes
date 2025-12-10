import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

import { KnowledgeEditorGuidanceDiscardDraftModal } from './KnowledgeEditorGuidanceDiscardDraftModal'

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(),
}))

const mockedUseGuidanceArticleMutation = jest.mocked(useGuidanceArticleMutation)

describe('KnowledgeEditorGuidanceDiscardDraftModal', () => {
    const defaultProps = {
        isOpen: true,
        guidanceHelpCenterId: 1,
        guidanceArticleId: 123,
        locale: 'en-US' as const,
        onClose: jest.fn(),
        onDiscardSucceeded: jest.fn(),
        onDiscardFailed: jest.fn(),
    }

    const mockDiscardGuidanceDraft = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockedUseGuidanceArticleMutation.mockReturnValue({
            discardGuidanceDraft: mockDiscardGuidanceDraft,
            isDiscardingDraft: false,
        } as any)
    })

    it('should render modal with correct title when open', () => {
        render(<KnowledgeEditorGuidanceDiscardDraftModal {...defaultProps} />)

        expect(screen.getByText('Discard draft?')).toBeInTheDocument()
    })

    it('should not render modal when closed', () => {
        render(
            <KnowledgeEditorGuidanceDiscardDraftModal
                {...defaultProps}
                isOpen={false}
            />,
        )

        expect(screen.queryByText('Discard draft?')).not.toBeInTheDocument()
    })

    it('should display warning message about permanent deletion', () => {
        render(<KnowledgeEditorGuidanceDiscardDraftModal {...defaultProps} />)

        expect(
            screen.getByText(
                /Your draft will be permanently deleted, this content can't be restored./,
            ),
        ).toBeInTheDocument()
    })

    it('should render Back to editing button', () => {
        render(<KnowledgeEditorGuidanceDiscardDraftModal {...defaultProps} />)

        expect(
            screen.getByRole('button', { name: /Back to editing/i }),
        ).toBeInTheDocument()
    })

    it('should render Discard draft button', () => {
        render(<KnowledgeEditorGuidanceDiscardDraftModal {...defaultProps} />)

        expect(
            screen.getByRole('button', { name: /Discard draft/i }),
        ).toBeInTheDocument()
    })

    it('should call onClose when Back to editing button is clicked', async () => {
        const user = userEvent.setup()
        render(<KnowledgeEditorGuidanceDiscardDraftModal {...defaultProps} />)

        const backButton = screen.getByRole('button', {
            name: /Back to editing/i,
        })

        await act(() => user.click(backButton))

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
        expect(mockDiscardGuidanceDraft).not.toHaveBeenCalled()
    })

    it('should call discardGuidanceDraft and onDiscardSucceeded when Discard draft button is clicked', async () => {
        const user = userEvent.setup()
        mockDiscardGuidanceDraft.mockResolvedValue(undefined)

        render(<KnowledgeEditorGuidanceDiscardDraftModal {...defaultProps} />)

        const discardButton = screen.getByRole('button', {
            name: /Discard draft/i,
        })

        await act(() => user.click(discardButton))

        expect(mockDiscardGuidanceDraft).toHaveBeenCalledWith(
            defaultProps.guidanceArticleId,
            defaultProps.locale,
        )
        expect(defaultProps.onDiscardSucceeded).toHaveBeenCalledTimes(1)
        expect(defaultProps.onDiscardFailed).not.toHaveBeenCalled()
    })

    it('should call onDiscardFailed when discardGuidanceDraft fails', async () => {
        const user = userEvent.setup()
        mockDiscardGuidanceDraft.mockRejectedValue(new Error('API Error'))

        render(<KnowledgeEditorGuidanceDiscardDraftModal {...defaultProps} />)

        const discardButton = screen.getByRole('button', {
            name: /Discard draft/i,
        })

        await act(() => user.click(discardButton))

        expect(mockDiscardGuidanceDraft).toHaveBeenCalledWith(
            defaultProps.guidanceArticleId,
            defaultProps.locale,
        )
        expect(defaultProps.onDiscardFailed).toHaveBeenCalledTimes(1)
        expect(defaultProps.onDiscardSucceeded).not.toHaveBeenCalled()
    })

    it('should not call onDiscardFailed when callback is not provided', async () => {
        const user = userEvent.setup()
        mockDiscardGuidanceDraft.mockRejectedValue(new Error('API Error'))

        const propsWithoutOnDiscardFailed = {
            ...defaultProps,
            onDiscardFailed: undefined,
        }

        render(
            <KnowledgeEditorGuidanceDiscardDraftModal
                {...propsWithoutOnDiscardFailed}
            />,
        )

        const discardButton = screen.getByRole('button', {
            name: /Discard draft/i,
        })

        await act(() => user.click(discardButton))

        expect(mockDiscardGuidanceDraft).toHaveBeenCalledWith(
            defaultProps.guidanceArticleId,
            defaultProps.locale,
        )
        expect(defaultProps.onDiscardSucceeded).not.toHaveBeenCalled()
    })

    it('should disable Back to editing button while discarding', () => {
        mockedUseGuidanceArticleMutation.mockReturnValue({
            discardGuidanceDraft: mockDiscardGuidanceDraft,
            isDiscardingDraft: true,
        } as any)

        render(<KnowledgeEditorGuidanceDiscardDraftModal {...defaultProps} />)

        const backButton = screen.getByRole('button', {
            name: /Back to editing/i,
        })

        expect(backButton).toBeDisabled()
    })

    it('should show loading state on Discard draft button while discarding', () => {
        mockedUseGuidanceArticleMutation.mockReturnValue({
            discardGuidanceDraft: mockDiscardGuidanceDraft,
            isDiscardingDraft: true,
        } as any)

        render(<KnowledgeEditorGuidanceDiscardDraftModal {...defaultProps} />)

        const discardButton = screen.getByRole('button', {
            name: /Discard draft/i,
        })

        expect(discardButton).toBeDisabled()
    })

    it('should call useGuidanceArticleMutation with correct help center ID', () => {
        render(<KnowledgeEditorGuidanceDiscardDraftModal {...defaultProps} />)

        expect(mockedUseGuidanceArticleMutation).toHaveBeenCalledWith({
            guidanceHelpCenterId: defaultProps.guidanceHelpCenterId,
        })
    })
})
