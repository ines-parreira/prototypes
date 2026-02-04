import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ArticlePublishModal } from './ArticlePublishModal'

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

describe('ArticlePublishModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUsePublishModal.mockReturnValue(defaultMockState)
    })

    it('renders modal with correct title when open', () => {
        render(<ArticlePublishModal />)

        expect(
            screen.getByRole('heading', { name: 'Publish changes' }),
        ).toBeInTheDocument()
    })

    it('does not render modal when closed', () => {
        mockUsePublishModal.mockReturnValue({
            ...defaultMockState,
            isOpen: false,
        })

        render(<ArticlePublishModal />)

        expect(
            screen.queryByRole('heading', { name: 'Publish changes' }),
        ).not.toBeInTheDocument()
    })

    it('renders commit message text field', () => {
        render(<ArticlePublishModal />)

        expect(
            screen.getByLabelText(/Describe your changes for version history/i),
        ).toBeInTheDocument()
    })

    it('renders Cancel and Publish buttons', () => {
        render(<ArticlePublishModal />)

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
        render(<ArticlePublishModal />)

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
        render(<ArticlePublishModal />)

        const textField = screen.getByLabelText(
            /Describe your changes for version history/i,
        )
        await user.type(textField, 'Updated article content')

        const modal = screen.getByRole('dialog')
        const publishButton = within(modal).getByRole('button', {
            name: 'Publish',
        })

        await act(() => user.click(publishButton))

        expect(mockOnPublish).toHaveBeenCalledWith('Updated article content')
    })

    it('calls onPublish with empty string when clicking Publish without entering a message', async () => {
        const user = userEvent.setup()
        render(<ArticlePublishModal />)

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

        render(<ArticlePublishModal />)

        const modal = screen.getByRole('dialog')
        const cancelButton = within(modal).getByRole('button', {
            name: 'Cancel',
        })

        expect(cancelButton).toBeDisabled()
    })
})
