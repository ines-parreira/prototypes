import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useHistory } from 'react-router-dom'

import { useJourneyContext } from 'AIJourney/providers'
import { ThemeProvider } from 'core/theme'

import { CustomFlowWebhookSetup } from './CustomFlowWebhookSetup'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
}))

jest.mock('AIJourney/providers', () => ({
    useJourneyContext: jest.fn(),
}))

const mockPush = jest.fn()
const mockUseHistory = useHistory as jest.MockedFunction<typeof useHistory>
const mockUseJourneyContext = useJourneyContext as jest.MockedFunction<
    typeof useJourneyContext
>

const renderComponent = () =>
    render(
        <MemoryRouter>
            <ThemeProvider>
                <CustomFlowWebhookSetup />
            </ThemeProvider>
        </MemoryRouter>,
    )

describe('<CustomFlowWebhookSetup />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseHistory.mockReturnValue({
            push: mockPush,
        } as unknown as ReturnType<typeof useHistory>)
    })

    it('renders the heading "Custom flow activated"', () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: { webhook_url: 'https://example.com/webhook' },
            shopName: 'test-store',
        } as unknown as ReturnType<typeof useJourneyContext>)

        renderComponent()

        expect(
            screen.getByRole('heading', { name: 'Custom flow activated' }),
        ).toBeInTheDocument()
    })

    it('renders KlaviyoSetupCard when webhook_url is present', () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: {
                webhook_url: 'https://app.gorgias.com/webhooks/journey/abc123',
            },
            shopName: 'test-store',
        } as unknown as ReturnType<typeof useJourneyContext>)

        renderComponent()

        expect(
            screen.getByDisplayValue(
                'https://app.gorgias.com/webhooks/journey/abc123',
            ),
        ).toBeInTheDocument()
    })

    it('does not render KlaviyoSetupCard when webhook_url is missing', () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: {},
            shopName: 'test-store',
        } as unknown as ReturnType<typeof useJourneyContext>)

        renderComponent()

        expect(screen.queryByText('Klaviyo setup')).not.toBeInTheDocument()
    })

    it('navigates to the flows page when "Go to flows" button is clicked', async () => {
        const user = userEvent.setup()

        mockUseJourneyContext.mockReturnValue({
            journeyData: {},
            shopName: 'my-shop',
        } as unknown as ReturnType<typeof useJourneyContext>)

        renderComponent()

        await user.click(screen.getByRole('button', { name: 'Go to flows' }))

        expect(mockPush).toHaveBeenCalledWith('/app/ai-journey/my-shop/flows')
    })
})
