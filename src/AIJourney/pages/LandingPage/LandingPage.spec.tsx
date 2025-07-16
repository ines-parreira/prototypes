import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { IntegrationsProvider } from 'AIJourney/providers'
import { useJourneys } from 'AIJourney/queries'
import { appQueryClient } from 'api/queryClient'
import { renderWithRouter } from 'utils/testing'

import { LandingPage } from './LandingPage'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

jest.mock('AIJourney/queries', () => ({
    ...jest.requireActual('AIJourney/queries'),
    useJourneys: jest.fn(() => ({
        data: [],
        isError: false,
    })),
}))

jest.mock('AIJourney/providers', () => ({
    ...jest.requireActual('AIJourney/providers'),
    useIntegrations: jest.fn(),
}))

const mockUseIntegrations = require('AIJourney/providers')
    .useIntegrations as jest.Mock

const mockUseJourneys = useJourneys as jest.Mock

describe('<LandingPage />', () => {
    afterEach(() => {
        mockHistoryPush.mockClear()
        jest.useRealTimers()
    })

    it('should render AI Journey landing page', () => {
        mockUseIntegrations.mockImplementation(() => ({
            integrations: [{ id: 1, name: 'shopify-store' }],
            isLoading: false,
        }))

        renderWithRouter(
            <QueryClientProvider client={appQueryClient}>
                <IntegrationsProvider>
                    <LandingPage />
                </IntegrationsProvider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('AI Journey Performance')).toBeInTheDocument()
    })
    it('should redirect to conversation-setup page when placeholder button is clicked', async () => {
        renderWithRouter(
            <QueryClientProvider client={appQueryClient}>
                <IntegrationsProvider>
                    <LandingPage />
                </IntegrationsProvider>
            </QueryClientProvider>,
        )

        const buttonLabel = screen.getByText('Try out now')
        expect(buttonLabel).toBeInTheDocument()

        const button = screen.getByTestId('ai-journey-button')
        await userEvent.click(button)
        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledTimes(1)
        })
    })

    it('should redirect to performance page when AI Journey is already active', async () => {
        mockUseJourneys.mockImplementationOnce(() => ({
            data: [{ type: 'cart_abandoned', state: 'active' }],
            isError: false,
        }))

        renderWithRouter(
            <QueryClientProvider client={appQueryClient}>
                <IntegrationsProvider>
                    <LandingPage />
                </IntegrationsProvider>
            </QueryClientProvider>,
        )

        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledTimes(1)
        })
    })
})
