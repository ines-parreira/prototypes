import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ArticleDeleteModal } from './ArticleDeleteModal'

const mockOnClose = jest.fn()
const mockOnDelete = jest.fn()

const mockUseDeleteArticleModal = jest.fn()

jest.mock('./useDeleteArticleModal', () => ({
    useDeleteArticleModal: () => mockUseDeleteArticleModal(),
}))

const defaultMockState = {
    isOpen: true,
    isDeleting: false,
    hasBothVersions: false,
    onClose: mockOnClose,
    onDelete: mockOnDelete,
}

describe('ArticleDeleteModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseDeleteArticleModal.mockReturnValue(defaultMockState)
    })

    it('renders modal with correct title when open', () => {
        render(<ArticleDeleteModal />)

        expect(screen.getByText('Delete?')).toBeInTheDocument()
    })

    it('does not render modal when closed', () => {
        mockUseDeleteArticleModal.mockReturnValue({
            ...defaultMockState,
            isOpen: false,
        })

        render(<ArticleDeleteModal />)

        expect(screen.queryByText('Delete?')).not.toBeInTheDocument()
    })

    describe('warning message', () => {
        it('displays short message when only one version exists', () => {
            render(<ArticleDeleteModal />)

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
            mockUseDeleteArticleModal.mockReturnValue({
                ...defaultMockState,
                hasBothVersions: true,
            })

            render(<ArticleDeleteModal />)

            expect(
                screen.getByText(
                    /Once deleted, this content can't be restored.*Both the draft and the published version will be permanently deleted./,
                ),
            ).toBeInTheDocument()
        })
    })

    it('renders Back to editing button', () => {
        render(<ArticleDeleteModal />)

        expect(
            screen.getByRole('button', { name: /Back to editing/i }),
        ).toBeInTheDocument()
    })

    it('renders Delete button', () => {
        render(<ArticleDeleteModal />)

        expect(
            screen.getByRole('button', { name: /Delete/i }),
        ).toBeInTheDocument()
    })

    it('calls onClose when Back to editing button is clicked', async () => {
        const user = userEvent.setup()
        render(<ArticleDeleteModal />)

        const backButton = screen.getByRole('button', {
            name: /Back to editing/i,
        })

        await act(() => user.click(backButton))

        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(mockOnDelete).not.toHaveBeenCalled()
    })

    it('calls onDelete when Delete button is clicked', async () => {
        const user = userEvent.setup()

        render(<ArticleDeleteModal />)

        const deleteButton = screen.getByRole('button', { name: /^Delete$/i })

        await act(() => user.click(deleteButton))

        expect(mockOnDelete).toHaveBeenCalledTimes(1)
    })

    it('disables Back to editing button while deleting', () => {
        mockUseDeleteArticleModal.mockReturnValue({
            ...defaultMockState,
            isDeleting: true,
        })

        render(<ArticleDeleteModal />)

        const backButton = screen.getByRole('button', {
            name: /Back to editing/i,
        })

        expect(backButton).toBeDisabled()
    })

    it('disables Delete button while deleting', () => {
        mockUseDeleteArticleModal.mockReturnValue({
            ...defaultMockState,
            isDeleting: true,
        })

        render(<ArticleDeleteModal />)

        const deleteButton = screen.getByText('Delete').closest('button')

        expect(deleteButton).toBeDisabled()
    })
})
