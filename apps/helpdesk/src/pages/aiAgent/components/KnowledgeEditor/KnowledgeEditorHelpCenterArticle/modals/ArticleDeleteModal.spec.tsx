import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { ArticleModeType } from '../context/types'
import { ArticleDeleteModal } from './ArticleDeleteModal'

const mockOnClose = jest.fn()
const mockOnDelete = jest.fn()
const mockOnDiscardDraft = jest.fn()

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
    onDiscardDraft: mockOnDiscardDraft,
}

const defaultContextState = {
    state: {
        mode: 'edit' as ArticleModeType,
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

        it('displays full message when both versions exist in edit mode', () => {
            mockUseDeleteArticleModal.mockReturnValue({
                ...defaultMockState,
                hasBothVersions: true,
            })
            mockUseArticleContext.mockReturnValue({
                state: { mode: 'edit' as ArticleModeType },
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
                mode: 'read' as ArticleModeType,
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

    it('renders Delete article button', () => {
        render(<ArticleDeleteModal />)

        expect(
            screen.getByRole('button', { name: /Delete article/i }),
        ).toBeInTheDocument()
    })

    it('calls onClose when Back to editing button is clicked in edit mode', async () => {
        const user = userEvent.setup()
        render(<ArticleDeleteModal />)

        const backButton = screen.getByRole('button', {
            name: /Back to editing/i,
        })

        await user.click(backButton)

        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(mockOnDelete).not.toHaveBeenCalled()
    })

    it('calls onClose when Cancel button is clicked in read mode', async () => {
        const user = userEvent.setup()
        mockUseArticleContext.mockReturnValue({
            state: {
                mode: 'read' as ArticleModeType,
            },
        })

        render(<ArticleDeleteModal />)

        const cancelButton = screen.getByRole('button', {
            name: /Cancel/i,
        })

        await user.click(cancelButton)

        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(mockOnDelete).not.toHaveBeenCalled()
    })

    it('calls onDelete when Delete article button is clicked', async () => {
        const user = userEvent.setup()

        render(<ArticleDeleteModal />)

        const deleteButton = screen.getByRole('button', {
            name: /Delete article/i,
        })

        await user.click(deleteButton)

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
                mode: 'read' as ArticleModeType,
            },
        })

        render(<ArticleDeleteModal />)

        const cancelButton = screen.getByRole('button', {
            name: /Cancel/i,
        })

        expect(cancelButton).toBeDisabled()
    })

    it('disables Delete article button while deleting', () => {
        mockUseDeleteArticleModal.mockReturnValue({
            ...defaultMockState,
            isDeleting: true,
        })

        render(<ArticleDeleteModal />)

        const deleteButton = screen.getByRole('button', {
            name: /Delete article/i,
        })

        expect(deleteButton).toBeDisabled()
    })

    describe('when hasBothVersions is true and mode is read', () => {
        beforeEach(() => {
            mockUseDeleteArticleModal.mockReturnValue({
                ...defaultMockState,
                hasBothVersions: true,
            })
            mockUseArticleContext.mockReturnValue({
                state: { mode: 'read' as ArticleModeType },
            })
        })

        it('renders "Discard draft" button', () => {
            render(<ArticleDeleteModal />)

            expect(
                screen.getByRole('button', { name: /Discard draft/i }),
            ).toBeInTheDocument()
        })

        it('renders "Delete article" button', () => {
            render(<ArticleDeleteModal />)

            expect(
                screen.getByRole('button', { name: /Delete article/i }),
            ).toBeInTheDocument()
        })

        it('does NOT render the plain "Delete" button', () => {
            render(<ArticleDeleteModal />)

            expect(
                screen.queryByRole('button', { name: /^Delete$/i }),
            ).not.toBeInTheDocument()
        })

        it('renders "Cancel" button', () => {
            render(<ArticleDeleteModal />)

            expect(
                screen.getByRole('button', { name: /Cancel/i }),
            ).toBeInTheDocument()
        })

        it('calls onDiscardDraft when "Discard draft" is clicked', async () => {
            const user = userEvent.setup()
            render(<ArticleDeleteModal />)

            await user.click(
                screen.getByRole('button', { name: /Discard draft/i }),
            )

            expect(mockOnDiscardDraft).toHaveBeenCalledTimes(1)
            expect(mockOnDelete).not.toHaveBeenCalled()
        })

        it('calls onDelete when "Delete article" is clicked', async () => {
            const user = userEvent.setup()
            render(<ArticleDeleteModal />)

            await user.click(
                screen.getByRole('button', { name: /Delete article/i }),
            )

            expect(mockOnDelete).toHaveBeenCalledTimes(1)
            expect(mockOnDiscardDraft).not.toHaveBeenCalled()
        })

        it('disables all three buttons while isDeleting is true', () => {
            mockUseDeleteArticleModal.mockReturnValue({
                ...defaultMockState,
                hasBothVersions: true,
                isDeleting: true,
            })

            render(<ArticleDeleteModal />)

            expect(
                screen.getByRole('button', { name: /Cancel/i }),
            ).toBeDisabled()
            expect(
                screen.getByRole('button', { name: /Delete article/i }),
            ).toBeDisabled()
            expect(
                screen.getByRole('button', { name: /Discard draft/i }),
            ).toBeDisabled()
        })
    })
})
