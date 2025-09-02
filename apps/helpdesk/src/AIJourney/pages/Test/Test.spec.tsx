import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { IntegrationType } from '@gorgias/helpdesk-types'

import { IntegrationsProvider } from 'AIJourney/providers'
import { appQueryClient } from 'api/queryClient'
import useAllIntegrations from 'hooks/useAllIntegrations'
import { renderWithRouter } from 'utils/testing'

import { Test } from './Test'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

jest.mock('hooks/useAllIntegrations', () => ({
    __esModule: true,
    default: jest.fn(),
}))
;(useAllIntegrations as jest.Mock).mockReturnValue({
    integrations: [
        {
            id: 1,
            type: IntegrationType.Shopify,
            name: 'shopify-store',
            meta: { shop_name: 'shopify-store' },
        },
    ],
    isLoading: false,
})

describe('<Test />', () => {
    beforeEach(() => {
        mockUseJourneyContext.mockImplementation(() => ({
            journey: null,
            journeyData: null,
            currentIntegration: { id: 1, name: 'shopify-store' },
            shopName: 'shopify-store',
            isLoading: false,
            storeConfiguration: {
                monitoredSmsIntegrations: [],
            },
        }))

        const originalOpen = XMLHttpRequest.prototype.open
        XMLHttpRequest.prototype.open = function (method, url) {
            console.error('XMLHttpRequest called with:', method, url)
            originalOpen.apply(this, arguments as any)
        }
    })

    afterEach(() => {
        mockHistoryPush.mockClear()
    })

    it('should render AI Journey landing page', () => {
        renderWithRouter(
            <QueryClientProvider client={appQueryClient}>
                <IntegrationsProvider>
                    <Test />
                </IntegrationsProvider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('Test page')).toBeInTheDocument()
        expect(screen.getByText('AI Journey playground')).toBeInTheDocument()
    })

    it('should redirect to activate page when continue button is clicked', async () => {
        renderWithRouter(
            <QueryClientProvider client={appQueryClient}>
                <Test />
            </QueryClientProvider>,
        )

        const linkElement = screen.getByRole('link', { name: 'Return' })
        expect(linkElement).toHaveAttribute(
            'href',
            '/app/ai-journey/shopify-store/setup',
        ) // return button should have correct link

        const button = screen.getByTestId('ai-journey-button')
        await userEvent.click(button)
        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/ai-journey/shopify-store/activate',
            )
        })
    })
})
