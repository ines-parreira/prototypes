import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithRouter } from 'utils/testing'

import { SmsSenderRequiredModal } from './SmsSenderRequiredModal'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockHistoryPush }),
}))

describe('<SmsSenderRequiredModal />', () => {
    const mockOnClose = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should not render modal content when isOpen is false', () => {
        renderWithRouter(
            <SmsSenderRequiredModal
                isOpen={false}
                onClose={mockOnClose}
                settingsUrl="/settings"
            />,
        )

        expect(
            screen.queryByText('Add sender phone number'),
        ).not.toBeInTheDocument()
    })

    it('should render modal content when isOpen is true', () => {
        renderWithRouter(
            <SmsSenderRequiredModal
                isOpen={true}
                onClose={mockOnClose}
                settingsUrl="/settings"
            />,
        )

        expect(screen.getByText('Add sender phone number')).toBeInTheDocument()
    })

    it('should render flow description when isCampaign is false', () => {
        renderWithRouter(
            <SmsSenderRequiredModal
                isOpen={true}
                onClose={mockOnClose}
                settingsUrl="/settings"
                isCampaign={false}
            />,
        )

        expect(
            screen.getByText(
                'Select a phone number in Settings to activate this flow.',
            ),
        ).toBeInTheDocument()
    })

    it('should render flow description by default when isCampaign is not provided', () => {
        renderWithRouter(
            <SmsSenderRequiredModal
                isOpen={true}
                onClose={mockOnClose}
                settingsUrl="/settings"
            />,
        )

        expect(
            screen.getByText(
                'Select a phone number in Settings to activate this flow.',
            ),
        ).toBeInTheDocument()
    })

    it('should render campaign description when isCampaign is true', () => {
        renderWithRouter(
            <SmsSenderRequiredModal
                isOpen={true}
                onClose={mockOnClose}
                settingsUrl="/settings"
                isCampaign={true}
            />,
        )

        expect(
            screen.getByText(
                'Select a phone number in Settings to send this campaign.',
            ),
        ).toBeInTheDocument()
    })

    it('should call onClose when Cancel is clicked', async () => {
        const user = userEvent.setup()
        renderWithRouter(
            <SmsSenderRequiredModal
                isOpen={true}
                onClose={mockOnClose}
                settingsUrl="/settings"
            />,
        )

        await user.click(screen.getByRole('button', { name: /cancel/i }))

        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(mockHistoryPush).not.toHaveBeenCalled()
    })

    it('should call onClose when modal is dismissed via Escape key', async () => {
        const user = userEvent.setup()
        renderWithRouter(
            <SmsSenderRequiredModal
                isOpen={true}
                onClose={mockOnClose}
                settingsUrl="/settings"
            />,
        )

        await user.keyboard('{Escape}')

        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose and navigate when "Go to Settings" is clicked', async () => {
        const user = userEvent.setup()
        renderWithRouter(
            <SmsSenderRequiredModal
                isOpen={true}
                onClose={mockOnClose}
                settingsUrl="/app/ai-journey/my-shop/settings"
            />,
        )

        await user.click(
            screen.getByRole('button', { name: /go to settings/i }),
        )

        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(mockHistoryPush).toHaveBeenCalledWith(
            '/app/ai-journey/my-shop/settings',
        )
    })
})
