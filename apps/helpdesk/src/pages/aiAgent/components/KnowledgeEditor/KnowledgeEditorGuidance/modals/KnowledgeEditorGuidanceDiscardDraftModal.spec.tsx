import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { KnowledgeEditorGuidanceDiscardDraftModal } from './KnowledgeEditorGuidanceDiscardDraftModal'

const mockOnClose = jest.fn()
const mockOnDiscard = jest.fn()

const mockUseDiscardDraftModal = jest.fn()

jest.mock('./useDiscardDraftModal', () => ({
    useDiscardDraftModal: () => mockUseDiscardDraftModal(),
}))

const defaultMockState = {
    isOpen: true,
    isDiscarding: false,
    onClose: mockOnClose,
    onDiscard: mockOnDiscard,
}

describe('KnowledgeEditorGuidanceDiscardDraftModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseDiscardDraftModal.mockReturnValue(defaultMockState)
    })

    it('renders modal with correct title when open', () => {
        render(<KnowledgeEditorGuidanceDiscardDraftModal />)

        expect(screen.getByText('Delete draft?')).toBeInTheDocument()
    })

    it('does not render modal when closed', () => {
        mockUseDiscardDraftModal.mockReturnValue({
            ...defaultMockState,
            isOpen: false,
        })

        render(<KnowledgeEditorGuidanceDiscardDraftModal />)

        expect(screen.queryByText('Delete draft?')).not.toBeInTheDocument()
    })

    it('displays warning message about permanent deletion', () => {
        render(<KnowledgeEditorGuidanceDiscardDraftModal />)

        expect(
            screen.getByText(
                /Your draft will be permanently deleted, this content can't be restored./,
            ),
        ).toBeInTheDocument()
    })

    it('renders Back to editing button', () => {
        render(<KnowledgeEditorGuidanceDiscardDraftModal />)

        expect(
            screen.getByRole('button', { name: /Back to editing/i }),
        ).toBeInTheDocument()
    })

    it('renders Delete draft button', () => {
        render(<KnowledgeEditorGuidanceDiscardDraftModal />)

        expect(
            screen.getByRole('button', { name: /Delete draft/i }),
        ).toBeInTheDocument()
    })

    it('calls onClose when Back to editing button is clicked', async () => {
        const user = userEvent.setup()
        render(<KnowledgeEditorGuidanceDiscardDraftModal />)

        const backButton = screen.getByRole('button', {
            name: /Back to editing/i,
        })

        await act(() => user.click(backButton))

        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(mockOnDiscard).not.toHaveBeenCalled()
    })

    it('calls onDiscard when Delete draft button is clicked', async () => {
        const user = userEvent.setup()

        render(<KnowledgeEditorGuidanceDiscardDraftModal />)

        const deleteButton = screen.getByRole('button', {
            name: /Delete draft/i,
        })

        await act(() => user.click(deleteButton))

        expect(mockOnDiscard).toHaveBeenCalledTimes(1)
    })

    it('disables Back to editing button while discarding', () => {
        mockUseDiscardDraftModal.mockReturnValue({
            ...defaultMockState,
            isDiscarding: true,
        })

        render(<KnowledgeEditorGuidanceDiscardDraftModal />)

        const backButton = screen.getByRole('button', {
            name: /Back to editing/i,
        })

        expect(backButton).toBeDisabled()
    })

    it('disables Delete draft button while deleting', () => {
        mockUseDiscardDraftModal.mockReturnValue({
            ...defaultMockState,
            isDiscarding: true,
        })

        render(<KnowledgeEditorGuidanceDiscardDraftModal />)

        const deleteButton = screen.getByRole('button', {
            name: /Delete draft/i,
        })

        expect(deleteButton).toBeDisabled()
    })
})
