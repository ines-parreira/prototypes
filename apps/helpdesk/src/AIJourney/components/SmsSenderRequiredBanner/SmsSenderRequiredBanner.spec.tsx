import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithRouter } from 'utils/testing'

import { SmsSenderRequiredBanner } from './SmsSenderRequiredBanner'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockHistoryPush }),
}))

describe('<SmsSenderRequiredBanner />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the banner title', () => {
        renderWithRouter(<SmsSenderRequiredBanner settingsUrl="/settings" />)

        expect(
            screen.getByText('Add sender phone number to activate'),
        ).toBeInTheDocument()
    })

    it('should render flow description when isCampaign is false', () => {
        renderWithRouter(
            <SmsSenderRequiredBanner
                settingsUrl="/settings"
                isCampaign={false}
            />,
        )

        expect(
            screen.getByText(
                'Select a phone number in Settings before this flow can go live.',
            ),
        ).toBeInTheDocument()
    })

    it('should render flow description by default when isCampaign is not provided', () => {
        renderWithRouter(<SmsSenderRequiredBanner settingsUrl="/settings" />)

        expect(
            screen.getByText(
                'Select a phone number in Settings before this flow can go live.',
            ),
        ).toBeInTheDocument()
    })

    it('should render campaign description when isCampaign is true', () => {
        renderWithRouter(
            <SmsSenderRequiredBanner
                settingsUrl="/settings"
                isCampaign={true}
            />,
        )

        expect(
            screen.getByText(
                'Select a phone number in Settings before this campaign can go live.',
            ),
        ).toBeInTheDocument()
    })

    it('should navigate to settingsUrl when "Go to Settings" is clicked', async () => {
        const user = userEvent.setup()
        renderWithRouter(
            <SmsSenderRequiredBanner settingsUrl="/app/ai-journey/my-shop/settings" />,
        )

        await user.click(screen.getByRole('link', { name: /go to settings/i }))

        expect(mockHistoryPush).toHaveBeenCalledWith(
            '/app/ai-journey/my-shop/settings',
        )
    })
})
