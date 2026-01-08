import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { KnowledgeEditorGuidanceDeleteModal } from './KnowledgeEditorGuidanceDeleteModal'

const mockOnClose = jest.fn()
const mockOnDelete = jest.fn()

const mockUseDeleteModal = jest.fn()

jest.mock('./useDeleteModal', () => ({
    useDeleteModal: () => mockUseDeleteModal(),
}))

const defaultMockState = {
    isOpen: true,
    isDeleting: false,
    hasBothVersions: false,
    onClose: mockOnClose,
    onDelete: mockOnDelete,
}

describe('KnowledgeEditorGuidanceDeleteModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseDeleteModal.mockReturnValue(defaultMockState)
    })

    it('renders modal with correct title when open', () => {
        render(<KnowledgeEditorGuidanceDeleteModal />)

        expect(screen.getByText('Delete?')).toBeInTheDocument()
    })

    it('does not render modal when closed', () => {
        mockUseDeleteModal.mockReturnValue({
            ...defaultMockState,
            isOpen: false,
        })

        render(<KnowledgeEditorGuidanceDeleteModal />)

        expect(screen.queryByText('Delete?')).not.toBeInTheDocument()
    })

    describe('warning message', () => {
        it('displays short message when only one version exists', () => {
            render(<KnowledgeEditorGuidanceDeleteModal />)

            expect(
                screen.getByText(
                    "Once deleted, this content can't be restored.",
                ),
            ).toBeInTheDocument()
            expect(
                screen.queryByText(/Both the draft and the published version/),
            ).not.toBeInTheDocument()
        })

        it('displays full message when both draft and published versions exist', () => {
            mockUseDeleteModal.mockReturnValue({
                ...defaultMockState,
                hasBothVersions: true,
            })

            render(<KnowledgeEditorGuidanceDeleteModal />)

            expect(
                screen.getByText(
                    /Once deleted, this content can't be restored.*Both the draft and the published version will be permanently deleted./,
                ),
            ).toBeInTheDocument()
        })
    })

    it('renders Back to editing button', () => {
        render(<KnowledgeEditorGuidanceDeleteModal />)

        expect(
            screen.getByRole('button', { name: /Back to editing/i }),
        ).toBeInTheDocument()
    })

    it('renders Delete button', () => {
        render(<KnowledgeEditorGuidanceDeleteModal />)

        expect(
            screen.getByRole('button', { name: /Delete/i }),
        ).toBeInTheDocument()
    })

    it('calls onClose when Back to editing button is clicked', async () => {
        const user = userEvent.setup()
        render(<KnowledgeEditorGuidanceDeleteModal />)

        const backButton = screen.getByRole('button', {
            name: /Back to editing/i,
        })

        await act(() => user.click(backButton))

        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(mockOnDelete).not.toHaveBeenCalled()
    })

    it('calls onDelete when Delete button is clicked', async () => {
        const user = userEvent.setup()

        render(<KnowledgeEditorGuidanceDeleteModal />)

        const deleteButton = screen.getByRole('button', { name: /^Delete$/i })

        await act(() => user.click(deleteButton))

        expect(mockOnDelete).toHaveBeenCalledTimes(1)
    })

    it('disables Back to editing button while deleting', () => {
        mockUseDeleteModal.mockReturnValue({
            ...defaultMockState,
            isDeleting: true,
        })

        render(<KnowledgeEditorGuidanceDeleteModal />)

        const backButton = screen.getByRole('button', {
            name: /Back to editing/i,
        })

        expect(backButton).toBeDisabled()
    })

    it('disables Delete button while deleting', () => {
        mockUseDeleteModal.mockReturnValue({
            ...defaultMockState,
            isDeleting: true,
        })

        render(<KnowledgeEditorGuidanceDeleteModal />)

        const deleteButton = screen.getByText('Delete').closest('button')

        expect(deleteButton).toBeDisabled()
    })
})
