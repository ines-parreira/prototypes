import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { ArticleModeType } from '../context/types'
import { ArticleDeleteModal } from './ArticleDeleteModal'

const mockOnClose = jest.fn()
const mockOnDelete = jest.fn()

const mockUseDeleteArticleModal = jest.fn()
const mockUseArticleContext = jest.fn()

jest.mock('./useDeleteArticleModal', () => ({
    useDeleteArticleModal: () => mockUseDeleteArticleModal(),
}))

jest.mock('../context', () => ({
    useArticleContext: () => mockUseArticleContext(),
}))

const defaultMockState = {
    isOpen: true,
    isDeleting: false,
    hasBothVersions: false,
    onClose: mockOnClose,
    onDelete: mockOnDelete,
}

const defaultContextState = {
    state: {
        articleMode: 'edit' as ArticleModeType,
    },
}

describe('ArticleDeleteModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseDeleteArticleModal.mockReturnValue(defaultMockState)
        mockUseArticleContext.mockReturnValue(defaultContextState)
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

    it('renders Back to editing button when in edit mode', () => {
        render(<ArticleDeleteModal />)

        expect(
            screen.getByRole('button', { name: /Back to editing/i }),
        ).toBeInTheDocument()
    })

    it('renders Cancel button when in read mode', () => {
        mockUseArticleContext.mockReturnValue({
            state: {
                articleMode: 'read' as ArticleModeType,
            },
        })

        render(<ArticleDeleteModal />)

        expect(
            screen.getByRole('button', { name: /Cancel/i }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /Back to editing/i }),
        ).not.toBeInTheDocument()
    })

    it('renders Delete button', () => {
        render(<ArticleDeleteModal />)

        expect(
            screen.getByRole('button', { name: /Delete/i }),
        ).toBeInTheDocument()
    })

    it('calls onClose when Back to editing button is clicked in edit mode', async () => {
        const user = userEvent.setup()
        render(<ArticleDeleteModal />)

        const backButton = screen.getByRole('button', {
            name: /Back to editing/i,
        })

        await act(() => user.click(backButton))

        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(mockOnDelete).not.toHaveBeenCalled()
    })

    it('calls onClose when Cancel button is clicked in read mode', async () => {
        const user = userEvent.setup()
        mockUseArticleContext.mockReturnValue({
            state: {
                articleMode: 'read' as ArticleModeType,
            },
        })

        render(<ArticleDeleteModal />)

        const cancelButton = screen.getByRole('button', {
            name: /Cancel/i,
        })

        await act(() => user.click(cancelButton))

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

    it('disables Back to editing button while deleting in edit mode', () => {
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

    it('disables Cancel button while deleting in read mode', () => {
        mockUseDeleteArticleModal.mockReturnValue({
            ...defaultMockState,
            isDeleting: true,
        })
        mockUseArticleContext.mockReturnValue({
            state: {
                articleMode: 'read' as ArticleModeType,
            },
        })

        render(<ArticleDeleteModal />)

        const cancelButton = screen.getByRole('button', {
            name: /Cancel/i,
        })

        expect(cancelButton).toBeDisabled()
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
