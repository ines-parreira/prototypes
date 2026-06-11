import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { GuidanceModeType } from '../context/types'
import { KnowledgeEditorGuidanceDeleteModal } from './KnowledgeEditorGuidanceDeleteModal'

const mockOnClose = jest.fn()
const mockOnDelete = jest.fn()
const mockOnDiscardDraft = jest.fn()

const mockUseDeleteModal = jest.fn()
const mockUseGuidanceContext = jest.fn()

jest.mock('./useDeleteModal', () => ({
    useDeleteModal: () => mockUseDeleteModal(),
}))

jest.mock('../context', () => ({
    useGuidanceContext: () => mockUseGuidanceContext(),
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
        mode: 'edit' as GuidanceModeType,
    },
}

describe('KnowledgeEditorGuidanceDeleteModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseDeleteModal.mockReturnValue(defaultMockState)
        mockUseGuidanceContext.mockReturnValue(defaultContextState)
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

        it('displays full message when both versions exist in edit mode', () => {
            mockUseDeleteModal.mockReturnValue({
                ...defaultMockState,
                hasBothVersions: true,
            })
            mockUseGuidanceContext.mockReturnValue({
                state: { mode: 'edit' as GuidanceModeType },
            })

            render(<KnowledgeEditorGuidanceDeleteModal />)

            expect(
                screen.getByText(
                    /Once deleted, this content can't be restored.*Both the draft and the published version will be permanently deleted./,
                ),
            ).toBeInTheDocument()
        })
    })

    it('renders Back to editing button when in edit mode', () => {
        render(<KnowledgeEditorGuidanceDeleteModal />)

        expect(
            screen.getByRole('button', { name: /Back to editing/i }),
        ).toBeInTheDocument()
    })

    it('renders Cancel button when in read mode', () => {
        mockUseGuidanceContext.mockReturnValue({
            state: {
                mode: 'read' as GuidanceModeType,
            },
        })

        render(<KnowledgeEditorGuidanceDeleteModal />)

        expect(
            screen.getByRole('button', { name: /Cancel/i }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /Back to editing/i }),
        ).not.toBeInTheDocument()
    })

    it('renders Delete guidance button', () => {
        render(<KnowledgeEditorGuidanceDeleteModal />)

        expect(
            screen.getByRole('button', { name: /Delete guidance/i }),
        ).toBeInTheDocument()
    })

    it('calls onClose when Back to editing button is clicked in edit mode', async () => {
        const user = userEvent.setup()
        render(<KnowledgeEditorGuidanceDeleteModal />)

        const backButton = screen.getByRole('button', {
            name: /Back to editing/i,
        })

        await user.click(backButton)

        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(mockOnDelete).not.toHaveBeenCalled()
    })

    it('calls onClose when Cancel button is clicked in read mode', async () => {
        const user = userEvent.setup()
        mockUseGuidanceContext.mockReturnValue({
            state: {
                mode: 'read' as GuidanceModeType,
            },
        })

        render(<KnowledgeEditorGuidanceDeleteModal />)

        const cancelButton = screen.getByRole('button', {
            name: /Cancel/i,
        })

        await user.click(cancelButton)

        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(mockOnDelete).not.toHaveBeenCalled()
    })

    it('calls onDelete when Delete guidance button is clicked', async () => {
        const user = userEvent.setup()

        render(<KnowledgeEditorGuidanceDeleteModal />)

        const deleteButton = screen.getByRole('button', {
            name: /Delete guidance/i,
        })

        await user.click(deleteButton)

        expect(mockOnDelete).toHaveBeenCalledTimes(1)
    })

    it('disables Back to editing button while deleting in edit mode', () => {
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

    it('disables Cancel button while deleting in read mode', () => {
        mockUseDeleteModal.mockReturnValue({
            ...defaultMockState,
            isDeleting: true,
        })
        mockUseGuidanceContext.mockReturnValue({
            state: {
                mode: 'read' as GuidanceModeType,
            },
        })

        render(<KnowledgeEditorGuidanceDeleteModal />)

        const cancelButton = screen.getByRole('button', {
            name: /Cancel/i,
        })

        expect(cancelButton).toBeDisabled()
    })

    it('disables Delete guidance button while deleting', () => {
        mockUseDeleteModal.mockReturnValue({
            ...defaultMockState,
            isDeleting: true,
        })

        render(<KnowledgeEditorGuidanceDeleteModal />)

        const deleteButton = screen.getByRole('button', {
            name: /Delete guidance/i,
        })

        expect(deleteButton).toBeDisabled()
    })

    describe('when hasBothVersions is true and mode is read', () => {
        beforeEach(() => {
            mockUseDeleteModal.mockReturnValue({
                ...defaultMockState,
                hasBothVersions: true,
            })
            mockUseGuidanceContext.mockReturnValue({
                state: { mode: 'read' as GuidanceModeType },
            })
        })

        it('renders "Discard draft" button', () => {
            render(<KnowledgeEditorGuidanceDeleteModal />)

            expect(
                screen.getByRole('button', { name: /Discard draft/i }),
            ).toBeInTheDocument()
        })

        it('renders "Delete guidance" button', () => {
            render(<KnowledgeEditorGuidanceDeleteModal />)

            expect(
                screen.getByRole('button', { name: /Delete guidance/i }),
            ).toBeInTheDocument()
        })

        it('does NOT render the plain "Delete" button', () => {
            render(<KnowledgeEditorGuidanceDeleteModal />)

            expect(
                screen.queryByRole('button', { name: /^Delete$/i }),
            ).not.toBeInTheDocument()
        })

        it('renders "Cancel" button', () => {
            render(<KnowledgeEditorGuidanceDeleteModal />)

            expect(
                screen.getByRole('button', { name: /Cancel/i }),
            ).toBeInTheDocument()
        })

        it('calls onDiscardDraft when "Discard draft" is clicked', async () => {
            const user = userEvent.setup()
            render(<KnowledgeEditorGuidanceDeleteModal />)

            await user.click(
                screen.getByRole('button', { name: /Discard draft/i }),
            )

            expect(mockOnDiscardDraft).toHaveBeenCalledTimes(1)
            expect(mockOnDelete).not.toHaveBeenCalled()
        })

        it('calls onDelete when "Delete guidance" is clicked', async () => {
            const user = userEvent.setup()
            render(<KnowledgeEditorGuidanceDeleteModal />)

            await user.click(
                screen.getByRole('button', { name: /Delete guidance/i }),
            )

            expect(mockOnDelete).toHaveBeenCalledTimes(1)
            expect(mockOnDiscardDraft).not.toHaveBeenCalled()
        })

        it('disables all three buttons while isDeleting is true', () => {
            mockUseDeleteModal.mockReturnValue({
                ...defaultMockState,
                hasBothVersions: true,
                isDeleting: true,
            })

            render(<KnowledgeEditorGuidanceDeleteModal />)

            expect(
                screen.getByRole('button', { name: /Cancel/i }),
            ).toBeDisabled()
            expect(
                screen.getByRole('button', { name: /Delete guidance/i }),
            ).toBeDisabled()
            expect(
                screen.getByRole('button', { name: /Discard draft/i }),
            ).toBeDisabled()
        })
    })
})
