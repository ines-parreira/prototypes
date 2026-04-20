import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SkillDeleteModal } from './SkillDeleteModal'

const mockOnClose = jest.fn()
const mockOnDelete = jest.fn()

const mockUseSkillDeleteModal = jest.fn()

jest.mock('./useSkillDeleteModal', () => ({
    useSkillDeleteModal: () => mockUseSkillDeleteModal(),
}))

const defaultMockState = {
    isOpen: true,
    isDeleting: false,
    hasBothVersions: false,
    intents: [],
    onClose: mockOnClose,
    onDelete: mockOnDelete,
}

describe('SkillDeleteModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseSkillDeleteModal.mockReturnValue(defaultMockState)
    })

    it('renders title "Delete skill?"', () => {
        render(<SkillDeleteModal />)

        expect(
            screen.getByRole('heading', { name: 'Delete skill?' }),
        ).toBeInTheDocument()
    })

    it('shows intent names in bold when intents exist', () => {
        mockUseSkillDeleteModal.mockReturnValue({
            ...defaultMockState,
            intents: ['order::status', 'order::cancel'],
        })

        render(<SkillDeleteModal />)

        expect(screen.getByText('Order / Status')).toBeInTheDocument()
        expect(screen.getByText('Order / Cancel')).toBeInTheDocument()

        expect(
            screen.getByText(
                /intents will be unlinked, and AI Agent will use your knowledge to handle those conversations instead/,
            ),
        ).toBeInTheDocument()
    })

    it('shows "both versions" message when hasBothVersions and no intents', () => {
        mockUseSkillDeleteModal.mockReturnValue({
            ...defaultMockState,
            hasBothVersions: true,
            intents: [],
        })

        render(<SkillDeleteModal />)

        expect(
            screen.getByText(
                /Both the draft and the published version will be permanently deleted/,
            ),
        ).toBeInTheDocument()
    })

    it('calls onDelete when Delete button is clicked', async () => {
        const user = userEvent.setup()
        render(<SkillDeleteModal />)

        const modal = screen.getByRole('dialog')
        const deleteButton = within(modal).getByRole('button', {
            name: 'Delete',
        })

        await user.click(deleteButton)

        expect(mockOnDelete).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when Cancel button is clicked', async () => {
        const user = userEvent.setup()
        render(<SkillDeleteModal />)

        const modal = screen.getByRole('dialog')
        const cancelButton = within(modal).getByRole('button', {
            name: 'Cancel',
        })

        await user.click(cancelButton)

        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(mockOnDelete).not.toHaveBeenCalled()
    })

    it('shows loading state on Delete button when isDeleting', () => {
        mockUseSkillDeleteModal.mockReturnValue({
            ...defaultMockState,
            isDeleting: true,
        })

        render(<SkillDeleteModal />)

        const modal = screen.getByRole('dialog')
        const deleteButton = within(modal).getByRole('button', {
            name: /Delete/,
        })

        expect(deleteButton).toHaveAttribute('data-pending', 'true')
    })
})
