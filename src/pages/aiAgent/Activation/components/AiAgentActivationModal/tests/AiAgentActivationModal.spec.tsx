import React from 'react'

import { fireEvent, render } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'

import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { appQueryClient } from 'api/queryClient'
import { billingState } from 'fixtures/billing'
import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'
import { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

import { AiAgentActivationModal } from '../AiAgentActivationModal'

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
        await fireEvent.click(salesToggleLabel!)
        expect(onSalesEnabledMock).toHaveBeenCalled()
        expect(salesToggleLabel).toHaveAttribute('aria-checked', 'false')
    })

    it('should allow enabling sales if parent caller ask for it', async () => {
        const onCloseMock = jest.fn()
        const onSalesEnabledMock = jest.fn().mockReturnValue(true)
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
        await fireEvent.click(salesToggleLabel!)
        expect(onSalesEnabledMock).toHaveBeenCalled()
        expect(salesToggleLabel).toHaveAttribute('aria-checked', 'true')
    })
})
