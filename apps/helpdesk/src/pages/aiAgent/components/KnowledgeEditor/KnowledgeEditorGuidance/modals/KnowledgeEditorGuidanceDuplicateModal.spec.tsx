import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { KnowledgeEditorGuidanceDuplicateModal } from './KnowledgeEditorGuidanceDuplicateModal'

const mockOnClose = jest.fn()
const mockOnDuplicate = jest.fn()

const mockUseDuplicateModal = jest.fn()
const mockUseStoresWithCompletedSetup = jest.fn()

jest.mock('./useDuplicateModal', () => ({
    useDuplicateModal: () => mockUseDuplicateModal(),
}))

jest.mock('../../shared/DuplicateGuidance/useStoresWithCompletedSetup', () => ({
    useStoresWithCompletedSetup: () => mockUseStoresWithCompletedSetup(),
}))

const defaultModalState = {
    isOpen: true,
    isDuplicating: false,
    shopName: 'test-shop',
    onClose: mockOnClose,
    onDuplicate: mockOnDuplicate,
}

const defaultStores = [
    { name: 'test-shop', setupStatus: 'completed' },
    { name: 'other-shop', setupStatus: 'completed' },
]

describe('KnowledgeEditorGuidanceDuplicateModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseDuplicateModal.mockReturnValue(defaultModalState)
        mockUseStoresWithCompletedSetup.mockReturnValue(defaultStores)
    })

    it('renders modal with correct title when open', () => {
        render(<KnowledgeEditorGuidanceDuplicateModal />)

        expect(screen.getByText('Duplicate guidance')).toBeInTheDocument()
    })

    it('renders "Duplicate to" label', () => {
        render(<KnowledgeEditorGuidanceDuplicateModal />)

        expect(screen.getByText('Duplicate to')).toBeInTheDocument()
    })

    it('does not render modal when closed', () => {
        mockUseDuplicateModal.mockReturnValue({
            ...defaultModalState,
            isOpen: false,
        })

        render(<KnowledgeEditorGuidanceDuplicateModal />)

        expect(screen.queryByText('Duplicate guidance')).not.toBeInTheDocument()
    })

    it('renders Cancel button', () => {
        render(<KnowledgeEditorGuidanceDuplicateModal />)

        expect(
            screen.getByRole('button', { name: /Cancel/i }),
        ).toBeInTheDocument()
    })

    it('renders Duplicate button', () => {
        render(<KnowledgeEditorGuidanceDuplicateModal />)

        expect(
            screen.getByRole('button', { name: /^Duplicate$/i }),
        ).toBeInTheDocument()
    })

    it('disables Duplicate button when no stores are selected', () => {
        render(<KnowledgeEditorGuidanceDuplicateModal />)

        const applyButton = screen.getByRole('button', { name: /^Duplicate$/i })

        expect(applyButton).toBeDisabled()
    })

    it('calls onClose when Cancel button is clicked', async () => {
        const user = userEvent.setup()
        render(<KnowledgeEditorGuidanceDuplicateModal />)

        const cancelButton = screen.getByRole('button', { name: /Cancel/i })

        await act(() => user.click(cancelButton))

        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('disables Cancel button while duplicating', () => {
        mockUseDuplicateModal.mockReturnValue({
            ...defaultModalState,
            isDuplicating: true,
        })

        render(<KnowledgeEditorGuidanceDuplicateModal />)

        const cancelButton = screen.getByRole('button', { name: /Cancel/i })

        expect(cancelButton).toBeDisabled()
    })

    it('disables Duplicate button while duplicating', () => {
        mockUseDuplicateModal.mockReturnValue({
            ...defaultModalState,
            isDuplicating: true,
        })

        render(<KnowledgeEditorGuidanceDuplicateModal />)

        const applyButton = screen.getByRole('button', {
            name: /Duplicate Loading/i,
        })

        expect(applyButton).toBeDisabled()
    })

    it('renders MultiSelectField with correct label', () => {
        render(<KnowledgeEditorGuidanceDuplicateModal />)

        expect(screen.getByLabelText('Duplicate to')).toBeInTheDocument()
    })
})
