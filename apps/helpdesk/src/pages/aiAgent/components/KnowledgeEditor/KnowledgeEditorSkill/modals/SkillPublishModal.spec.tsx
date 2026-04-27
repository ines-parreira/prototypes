import { render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { SkillPublishModal } from './SkillPublishModal'

const mockOnClose = jest.fn()
const mockOnPublish = jest.fn(() => Promise.resolve())

const mockUseSkillPublishModal = jest.fn()

jest.mock('./useSkillPublishModal', () => ({
    useSkillPublishModal: () => mockUseSkillPublishModal(),
}))

const defaultMockState = {
    isOpen: true,
    isPublishing: false,
    bannerType: 'none' as const,
    skillsToDisableInfo: [],
    onClose: mockOnClose,
    onPublish: mockOnPublish,
}

const renderComponent = () =>
    render(
        <MemoryRouter>
            <SkillPublishModal />
        </MemoryRouter>,
    )

describe('SkillPublishModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseSkillPublishModal.mockReturnValue(defaultMockState)
    })

    it('renders title "Publish changes?"', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: 'Publish changes?' }),
        ).toBeInTheDocument()
    })

    it('shows info banner when bannerType is intents-affected', () => {
        mockUseSkillPublishModal.mockReturnValue({
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

    it('shows skills-disabled banner with skill links when bannerType is skills-disabled', () => {
        mockUseSkillPublishModal.mockReturnValue({
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

    it('does not show banner when bannerType is none', () => {
        renderComponent()

        expect(
            screen.queryByText(/Updates to this skill's intents will affect/),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText(/Reassigning intents will disable/),
        ).not.toBeInTheDocument()
    })

    it('renders change summary textarea', () => {
        renderComponent()

        expect(screen.getByLabelText(/Change summary/i)).toBeInTheDocument()
    })

    it('calls onPublish with commit message when Publish is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const textField = screen.getByLabelText(/Change summary/i)
        await user.type(textField, 'Updated return policy')

        const modal = screen.getByRole('dialog')
        const publishButton = within(modal).getByRole('button', {
            name: 'Publish',
        })

        await user.click(publishButton)

        expect(mockOnPublish).toHaveBeenCalledWith('Updated return policy')
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
        expect(mockOnPublish).not.toHaveBeenCalled()
    })
})
