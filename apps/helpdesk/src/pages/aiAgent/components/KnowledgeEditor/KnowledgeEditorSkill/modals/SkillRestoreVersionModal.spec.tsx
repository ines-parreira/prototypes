import { render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SkillRestoreVersionModal } from './SkillRestoreVersionModal'

const mockOnClose = jest.fn()
const mockOnRestore = jest.fn()

const mockUseSkillRestoreVersionModal = jest.fn()

jest.mock('./useSkillRestoreVersionModal', () => ({
    useSkillRestoreVersionModal: () => mockUseSkillRestoreVersionModal(),
}))

const defaultMockState = {
    isOpen: true,
    isRestoring: false,
    onClose: mockOnClose,
    onRestore: mockOnRestore,
}

describe('SkillRestoreVersionModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseSkillRestoreVersionModal.mockReturnValue(defaultMockState)
    })

    it('renders title "Restore this version?"', () => {
        render(<SkillRestoreVersionModal />)

        expect(
            screen.getByRole('heading', { name: 'Restore this version?' }),
        ).toBeInTheDocument()
    })

    it('calls onRestore when "Restore as draft" is clicked', async () => {
        const user = userEvent.setup()
        render(<SkillRestoreVersionModal />)

        const modal = screen.getByRole('dialog')
        const restoreButton = within(modal).getByRole('button', {
            name: 'Restore as draft',
        })

        await user.click(restoreButton)

        expect(mockOnRestore).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when Cancel is clicked', async () => {
        const user = userEvent.setup()
        render(<SkillRestoreVersionModal />)

        const modal = screen.getByRole('dialog')
        const cancelButton = within(modal).getByRole('button', {
            name: 'Cancel',
        })

        await user.click(cancelButton)

        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(mockOnRestore).not.toHaveBeenCalled()
    })
})
