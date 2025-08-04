import { useLocalStorageWithExpiry } from '@repo/hooks'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { account } from 'fixtures/account'
import { integrationsStateWithShopify } from 'fixtures/integrations'
import { IntegrationType } from 'models/integration/constants'
import { usePendingTasksRuleEngine } from 'pages/aiAgent/Overview/hooks/pendingTasks/usePendingTasksRuleEngine'
import { useHasNoOnboardedStores } from 'pages/aiAgent/Overview/hooks/useHasNoOnboardedStores'
import { RootState } from 'state/types'
import { mockStore, renderWithRouter } from 'utils/testing'

import { PendingTasksSectionConnected } from '../PendingTasksSectionConnected'

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useLocalStorageWithExpiry: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/Overview/hooks/pendingTasks/usePendingTasksRuleEngine',
    () => ({
        usePendingTasksRuleEngine: jest.fn(),
    }),
)

jest.mock('pages/aiAgent/Overview/hooks/useHasNoOnboardedStores')
const mockUseHasNoOnboardedStores = jest.mocked(useHasNoOnboardedStores)

const defaultState = {
    currentAccount: fromJS(account),
    currentUser: fromJS({
        role: {
            name: 'admin',
        },
    }),
    integrations: integrationsStateWithShopify,
} as RootState

describe('PendingTasksSectionConnected', () => {
    const mockStores = [
        {
            id: 1,
            name: 'My Shop',
            type: IntegrationType.Shopify,
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useLocalStorageWithExpiry as jest.Mock).mockReturnValue({
            state: mockStores[0],
            setState: jest.fn(),
        })
        ;(usePendingTasksRuleEngine as jest.Mock).mockReturnValue({
            isLoading: false,
            isFetched: true,
            pendingTasks: [],
            completedTasks: [],
        })
        mockUseHasNoOnboardedStores.mockReturnValue(false)
    })

    it('should select the store from URL query parameter', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <PendingTasksSectionConnected />
            </Provider>,
            {
                route: '/ai-agent/overview?shopName=My Shop',
                path: '/ai-agent/overview',
            },
        )

        expect(usePendingTasksRuleEngine).toHaveBeenCalledWith({
            accountDomain: 'acme',
            storeName: 'My Shop',
            storeType: IntegrationType.Shopify,
            refetchOnWindowFocus: false,
        })
    })

    it('should select the first store when no shopName in URL', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <PendingTasksSectionConnected />
            </Provider>,
            {
                route: '/ai-agent/overview',
                path: '/ai-agent/overview',
            },
        )

        expect(usePendingTasksRuleEngine).toHaveBeenCalledWith({
            accountDomain: 'acme',
            storeName: 'My Shop',
            storeType: IntegrationType.Shopify,
            refetchOnWindowFocus: false,
        })
    })

    it('should not render the section if there are no onboarded stores', () => {
        mockUseHasNoOnboardedStores.mockReturnValue(true)

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <PendingTasksSectionConnected />
            </Provider>,
            {
                route: '/ai-agent/overview?shopName=My Shop',
                path: '/ai-agent/overview',
            },
        )

        expect(
            screen.queryByText(
                'Congrats! You’ve finished all tasks for this store.',
            ),
        ).not.toBeInTheDocument()
    })
})
