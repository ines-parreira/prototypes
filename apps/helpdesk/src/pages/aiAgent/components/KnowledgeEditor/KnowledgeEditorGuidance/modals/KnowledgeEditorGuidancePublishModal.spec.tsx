import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { KnowledgeEditorGuidancePublishModal } from './KnowledgeEditorGuidancePublishModal'

const mockOnClose = jest.fn()
const mockOnPublish = jest.fn(() => Promise.resolve())

const mockUsePublishModal = jest.fn()

jest.mock('./usePublishModal', () => ({
    usePublishModal: () => mockUsePublishModal(),
}))

const defaultMockState = {
    isOpen: true,
    isPublishing: false,
    onClose: mockOnClose,
    onPublish: mockOnPublish,
}

describe('KnowledgeEditorGuidancePublishModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUsePublishModal.mockReturnValue(defaultMockState)
    })

    it('renders modal with correct title when open', () => {
        render(<KnowledgeEditorGuidancePublishModal />)

        expect(
            screen.getByRole('heading', { name: 'Publish changes' }),
        ).toBeInTheDocument()
    })

    it('does not render modal when closed', () => {
        mockUsePublishModal.mockReturnValue({
            ...defaultMockState,
            isOpen: false,
        })

        render(<KnowledgeEditorGuidancePublishModal />)

        expect(
            screen.queryByRole('heading', { name: 'Publish changes' }),
        ).not.toBeInTheDocument()
    })

    it('renders commit message text field', () => {
        render(<KnowledgeEditorGuidancePublishModal />)

        expect(screen.getByLabelText(/Change summary/i)).toBeInTheDocument()
    })

    it('renders Cancel and Publish buttons', () => {
        render(<KnowledgeEditorGuidancePublishModal />)

        const modal = screen.getByRole('dialog')
        expect(
            within(modal).getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
        expect(
            within(modal).getByRole('button', { name: 'Publish' }),
        ).toBeInTheDocument()
    })

    it('calls onClose when Cancel button is clicked', async () => {
        const user = userEvent.setup()
        render(<KnowledgeEditorGuidancePublishModal />)

        const modal = screen.getByRole('dialog')
        const cancelButton = within(modal).getByRole('button', {
            name: 'Cancel',
        })

        await act(() => user.click(cancelButton))

        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(mockOnPublish).not.toHaveBeenCalled()
    })

    it('calls onPublish with commit message when Publish button is clicked', async () => {
        const user = userEvent.setup()
        render(<KnowledgeEditorGuidancePublishModal />)

        const textField = screen.getByLabelText(/Change summary/i)
        await user.type(textField, 'Updated guidance content')

        const modal = screen.getByRole('dialog')
        const publishButton = within(modal).getByRole('button', {
            name: 'Publish',
        })

        await act(() => user.click(publishButton))

        expect(mockOnPublish).toHaveBeenCalledWith('Updated guidance content')
    })

    it('calls onPublish with empty string when clicking Publish without entering a message', async () => {
        const user = userEvent.setup()
        render(<KnowledgeEditorGuidancePublishModal />)

        const modal = screen.getByRole('dialog')
        const publishButton = within(modal).getByRole('button', {
            name: 'Publish',
        })

        await act(() => user.click(publishButton))

        expect(mockOnPublish).toHaveBeenCalledWith('')
    })

    it('disables Cancel button while publishing', () => {
        mockUsePublishModal.mockReturnValue({
            ...defaultMockState,
            isPublishing: true,
        })

        render(<KnowledgeEditorGuidancePublishModal />)

        const modal = screen.getByRole('dialog')
        const cancelButton = within(modal).getByRole('button', {
            name: 'Cancel',
        })

        expect(cancelButton).toBeDisabled()
    })
})
