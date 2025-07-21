import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'

import { IntegrationsProvider } from 'AIJourney/providers'
import { appQueryClient } from 'api/queryClient'
import { mockStore, renderWithRouter } from 'utils/testing'

import { Performance } from './Performance'

jest.mock('AIJourney/queries', () => ({
    ...jest.requireActual('AIJourney/queries'),
    useJourneys: jest.fn(),
}))

const mockUseJourneys = require('AIJourney/queries').useJourneys as jest.Mock

describe('<Performance />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseJourneys.mockImplementation(() => ({
            data: [
                { id: 'journey-123', type: 'cart_abandoned', state: 'active' },
            ],
            isError: false,
            isLoading: false,
        }))
    })
    it('should render AI Journey performance page', () => {
        renderWithRouter(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <IntegrationsProvider>
                        <Performance />
                    </IntegrationsProvider>
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('AI Journey Performance')).toBeInTheDocument()
    })

    it('filters journeys correctly', async () => {
        renderWithRouter(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <IntegrationsProvider>
                        <Performance />
                    </IntegrationsProvider>
                </Provider>
            </QueryClientProvider>,
        )

        await waitFor(() => {
            expect(screen.getByText('Abandoned Cart')).toBeInTheDocument()
            expect(
                screen.getAllByText('Welcome New Subscribers').length,
            ).toBeGreaterThan(0)
            expect(
                screen.getAllByText('Post-Purchase Follow-up').length,
            ).toBeGreaterThan(0)
            expect(
                screen.getAllByText('Customer Winback').length,
            ).toBeGreaterThan(0)
        })

        await userEvent.click(screen.getByText('Active'))
        await waitFor(() => {
            expect(screen.getByText('Abandoned Cart')).toBeInTheDocument()
            expect(
                screen.queryByText('Welcome New Subscribers'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Post-Purchase Follow-up'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Customer Winback'),
            ).not.toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Coming soon'))
        await waitFor(() => {
            expect(screen.queryByText('Abandoned Cart')).not.toBeInTheDocument()
            expect(
                screen.getAllByText('Welcome New Subscribers').length,
            ).toBeGreaterThan(0)
            expect(
                screen.getAllByText('Post-Purchase Follow-up').length,
            ).toBeGreaterThan(0)
            expect(
                screen.getAllByText('Customer Winback').length,
            ).toBeGreaterThan(0)
        })
    })
})
