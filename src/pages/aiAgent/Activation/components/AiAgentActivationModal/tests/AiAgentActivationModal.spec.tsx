import React from 'react'

import { fireEvent, render } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'

import { QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { appQueryClient } from 'api/queryClient'
import { TicketChannel } from 'business/types/ticket'
import { billingState } from 'fixtures/billing'
import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'
import { useStoresConfigurationMutation } from 'pages/aiAgent/hooks/useStoresConfigurationMutation'
import { RootState } from 'state/types'
import { assumeMock, mockStore } from 'utils/testing'

import { AiAgentActivationModal } from '../AiAgentActivationModal'

jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels', () => ({
    __esModule: true,
    useSelfServiceChatChannelsMultiStore: jest.fn(),
    default: () => [],
}))

const {
    useSelfServiceChatChannelsMultiStore:
        useSelfServiceChatChannelsMultiStoreMock,
} = jest.requireMock('pages/automate/common/hooks/useSelfServiceChatChannels')

jest.mock('pages/aiAgent/hooks/useStoresConfigurationMutation')
const useStoresConfigurationMutationMock = assumeMock(
    useStoresConfigurationMutation,
)

jest.mock('pages/aiAgent/hooks/useGetUsedEmailIntegrations', () => ({
    useGetUsedEmailIntegrations: () => [],
}))

const storeSupportWithEmailAndChatAndSales = {
    storeName: 'storeSupportWithEmailAndChatAndSales',
    scopes: [AiAgentScope.Support, AiAgentScope.Sales],
    chatChannelDeactivatedDatetime: null,
    emailChannelDeactivatedDatetime: null,
    monitoredChatIntegrations: [1],
    monitoredEmailIntegrations: [{ id: 2, email: 'foo@example.com' }],
} as any as StoreConfiguration

const storeSupportWithEmailAndChat = {
    storeName: 'storeSupportWithEmailAndChat',
    scopes: [AiAgentScope.Support],
    chatChannelDeactivatedDatetime: null,
    emailChannelDeactivatedDatetime: null,
    monitoredChatIntegrations: [1],
    monitoredEmailIntegrations: [{ id: 2, email: 'foo@example.com' }],
} as any as StoreConfiguration

describe('<AiAgentActivationModal />', () => {
    const upsertStoresConfigurationMock = jest.fn()

    beforeEach(() => {
        useStoresConfigurationMutationMock.mockReturnValue({
            upsertStoresConfiguration: upsertStoresConfigurationMock,
            isLoading: false,
            error: null,
        })

        useSelfServiceChatChannelsMultiStoreMock.mockReturnValue({
            storeSupportWithEmailAndChatAndSales: [],
            storeSupportWithEmailAndChat: [
                {
                    type: TicketChannel.Chat,
                    value: {
                        id: storeSupportWithEmailAndChat
                            .monitoredChatIntegrations[0],
                    },
                } as any,
            ],
        })
    })

    it('should render the modal with correct title and progress', () => {
        const onCloseMock = jest.fn()
        const { getByText } = render(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={appQueryClient}>
                    <AiAgentActivationModal
                        isOpen
                        pageName="ai-agent-overview"
                        accountDomain="my-account-domain"
                        onClose={onCloseMock}
                        storeConfigs={[
                            storeSupportWithEmailAndChatAndSales,
                            storeSupportWithEmailAndChat,
                        ]}
                        onSalesEnabled={() => true}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        expect(getByText('Manage AI Agent Activation')).toBeInTheDocument()
        expect(
            getByText('storeSupportWithEmailAndChatAndSales'),
        ).toBeInTheDocument()
        expect(getByText('storeSupportWithEmailAndChat')).toBeInTheDocument()
    })

    it('should prevent enabling sales if parent caller ask for it', async () => {
        const onCloseMock = jest.fn()
        const onSalesEnabledMock = jest.fn().mockReturnValue(false)
        const { getAllByRole } = render(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={appQueryClient}>
                    <AiAgentActivationModal
                        isOpen
                        accountDomain="my-account-domain"
                        onClose={onCloseMock}
                        storeConfigs={[storeSupportWithEmailAndChat]}
                        onSalesEnabled={onSalesEnabledMock}
                        pageName="any-page"
                    />
                </QueryClientProvider>
            </Provider>,
        )

        // Sales toggle is the second one
        const salesToggleLabel = getAllByRole('switch')[1]
        expect(salesToggleLabel).toBeInTheDocument()
        expect(salesToggleLabel).toHaveAttribute('aria-checked', 'false')
        fireEvent.click(salesToggleLabel!)
        expect(onSalesEnabledMock).toHaveBeenCalled()
        expect(salesToggleLabel).toHaveAttribute('aria-checked', 'false')
    })

    it('should allow enabling sales if parent caller ask for it', async () => {
        const onCloseMock = jest.fn()
        const onSalesEnabledMock = jest.fn().mockReturnValue(true)
        const { getAllByRole, getByText } = render(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                    integrations: fromJS({
                        integrations: [],
                    }),
                } as RootState)}
            >
                <QueryClientProvider client={appQueryClient}>
                    <AiAgentActivationModal
                        isOpen
                        accountDomain="my-account-domain"
                        onClose={onCloseMock}
                        storeConfigs={[storeSupportWithEmailAndChat]}
                        onSalesEnabled={onSalesEnabledMock}
                        pageName="any-page"
                    />
                </QueryClientProvider>
            </Provider>,
        )

        // Sales toggle is the second one
        const salesToggleLabel = getAllByRole('switch')[1]
        expect(salesToggleLabel).toBeInTheDocument()
        expect(salesToggleLabel).toHaveAttribute('aria-checked', 'false')
        fireEvent.click(salesToggleLabel!)
        expect(onSalesEnabledMock).toHaveBeenCalled()
        expect(salesToggleLabel).toHaveAttribute('aria-checked', 'true')

        const button = getByText('Save')
        userEvent.click(button)
        expect(upsertStoresConfigurationMock).toHaveBeenCalled()
    })
})
