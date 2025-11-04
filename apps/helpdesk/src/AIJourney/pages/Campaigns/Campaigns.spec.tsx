import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { CampaignProvider, IntegrationsProvider } from 'AIJourney/providers'
import { appQueryClient } from 'api/queryClient'
import { account } from 'fixtures/account'
import { renderWithRouter } from 'utils/testing'

import { Campaigns } from './Campaigns'

jest.mock('AIJourney/providers/CampaignProvider/CampaignProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/CampaignProvider/CampaignProvider',
    ),
    useCampaignContext: jest.fn(),
}))

const mockUseCampaignContext =
    require('AIJourney/providers/CampaignProvider/CampaignProvider')
        .useCampaignContext as jest.Mock

describe('<Campaigns />', () => {
    const mockStore = configureMockStore([thunk])({
        currentAccount: fromJS(account),
    })

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseCampaignContext.mockReturnValue({
            campaigns: [
                { id: '1', campaign: { title: 'Campaign 1', state: 'active' } },
                {
                    id: '2',
                    campaign: { title: 'Campaign 2', state: 'inactive' },
                },
            ],
            currentIntegration: { id: 1, name: 'Test Integration' },
            shopName: 'test-shop',
            isLoading: false,
            storeConfiguration: {
                storeName: 'test-shop',
                monitoredSmsIntegrations: [1, 2],
            },
        })
    })

    it('should render the campaigns page', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <IntegrationsProvider>
                        <CampaignProvider>
                            <Campaigns />
                        </CampaignProvider>
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            screen.getByRole('heading', { name: /campaigns/i }),
        ).toBeInTheDocument()
    })

    it('should render the campaigns table with data', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <IntegrationsProvider>
                        <CampaignProvider>
                            <Campaigns />
                        </CampaignProvider>
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(screen.getAllByText('Campaign 1')).toHaveLength(1)
        expect(screen.getAllByText('Campaign 2')).toHaveLength(1)
        expect(screen.getByText('Create campaign')).toBeInTheDocument()
    })

    it('should render empty state when no campaigns', () => {
        mockUseCampaignContext.mockReturnValue({
            campaigns: [],
            currentIntegration: { id: 1, name: 'Test Integration' },
            shopName: 'test-shop',
            isLoading: false,
            storeConfiguration: {
                storeName: 'test-shop',
                monitoredSmsIntegrations: [1, 2],
            },
        })

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <IntegrationsProvider>
                        <CampaignProvider>
                            <Campaigns />
                        </CampaignProvider>
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            screen.getByText('Create your first campaign'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Start reaching your customers today'),
        ).toBeInTheDocument()
    })
})
