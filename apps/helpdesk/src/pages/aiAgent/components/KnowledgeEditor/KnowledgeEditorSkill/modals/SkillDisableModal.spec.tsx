import { render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SkillDisableModal } from './SkillDisableModal'

const mockOnClose = jest.fn()
const mockOnDisable = jest.fn()

const mockUseSkillDisableModal = jest.fn()

jest.mock('./useSkillDisableModal', () => ({
    useSkillDisableModal: () => mockUseSkillDisableModal(),
}))

const defaultMockState = {
    isOpen: true,
    isDisabling: false,
    onClose: mockOnClose,
    onDisable: mockOnDisable,
}

describe('SkillDisableModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseSkillDisableModal.mockReturnValue(defaultMockState)
    })

    it('renders title "Disable skill?"', () => {
        render(<SkillDisableModal />)

        expect(
            screen.getByRole('heading', { name: 'Disable skill?' }),
        ).toBeInTheDocument()
    })

    it('shows the description text about AI Agent', () => {
        render(<SkillDisableModal />)

        expect(
            screen.getByText(
                'Disabling this skill means AI Agent will use your knowledge to handle conversations for the linked intents instead.',
            ),
        ).toBeInTheDocument()
    })

    it('calls onDisable when Disable button is clicked', async () => {
        const user = userEvent.setup()
        render(<SkillDisableModal />)

        const modal = screen.getByRole('dialog')
        const disableButton = within(modal).getByRole('button', {
            name: 'Disable',
        })

        await user.click(disableButton)

        expect(mockOnDisable).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when Cancel button is clicked', async () => {
        const user = userEvent.setup()
        render(<SkillDisableModal />)

        const modal = screen.getByRole('dialog')
        const cancelButton = within(modal).getByRole('button', {
            name: 'Cancel',
        })

        await user.click(cancelButton)

        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(mockOnDisable).not.toHaveBeenCalled()
    })
})
