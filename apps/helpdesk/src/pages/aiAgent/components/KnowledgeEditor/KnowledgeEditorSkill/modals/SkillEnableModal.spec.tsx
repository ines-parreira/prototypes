import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { SkillEnableModal } from './SkillEnableModal'

const mockOnClose = jest.fn()
const mockOnEnable = jest.fn()

const mockUseSkillEnableModal = jest.fn()

jest.mock('./useSkillEnableModal', () => ({
    useSkillEnableModal: () => mockUseSkillEnableModal(),
}))

const defaultMockState = {
    isOpen: true,
    isEnabling: false,
    bannerType: 'none' as const,
    skillsToDisableInfo: [],
    onClose: mockOnClose,
    onEnable: mockOnEnable,
}

const renderComponent = () =>
    render(
        <MemoryRouter>
            <SkillEnableModal />
        </MemoryRouter>,
    )

describe('SkillEnableModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseSkillEnableModal.mockReturnValue(defaultMockState)
    })

    it('renders title "Enable skill?"', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: 'Enable skill?' }),
        ).toBeInTheDocument()
    })

    it('shows conflict message when bannerType is intents-affected', () => {
        mockUseSkillEnableModal.mockReturnValue({
            ...defaultMockState,
            bannerType: 'intents-affected',
        })

        renderComponent()

        expect(
            screen.getByText(
                /Updates to this skill's intents will affect how AI Agent handles those conversations/,
            ),
        ).toBeInTheDocument()
    })

    it('shows skills-disabled message with links when bannerType is skills-disabled', () => {
        mockUseSkillEnableModal.mockReturnValue({
            ...defaultMockState,
            bannerType: 'skills-disabled',
            skillsToDisableInfo: [
                { id: 1, title: 'Return Policy', url: '/skills/1' },
                { id: 2, title: 'Shipping Info', url: '/skills/2' },
            ],
        })

        renderComponent()

        expect(
            screen.getByText(
                /Reassigning intents will disable the following skills/,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: 'Return Policy' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: 'Shipping Info' }),
        ).toBeInTheDocument()
    })

    it('calls onEnable when Enable is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const modal = screen.getByRole('dialog')
        const enableButton = within(modal).getByRole('button', {
            name: 'Enable',
        })

        await user.click(enableButton)

        expect(mockOnEnable).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when Cancel is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const modal = screen.getByRole('dialog')
        const cancelButton = within(modal).getByRole('button', {
            name: 'Cancel',
        })

        await user.click(cancelButton)

        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(mockOnEnable).not.toHaveBeenCalled()
    })
})
