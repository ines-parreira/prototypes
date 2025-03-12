import React from 'react'

import { render } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'

import { QueryClientProvider } from '@tanstack/react-query'

import { appQueryClient } from 'api/queryClient'
import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'

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
            <QueryClientProvider client={appQueryClient}>
                <AiAgentActivationModal
                    isOpen
                    accountDomain="my-account-domain"
                    onClose={onCloseMock}
                    storeConfigs={[
                        storeSupportWithEmailAndChatAndSales,
                        storeSupportWithEmailAndChat,
                    ]}
                />
            </QueryClientProvider>,
        )

        expect(getByText('Manage AI Agent Activation')).toBeInTheDocument()
        expect(
            getByText('storeSupportWithEmailAndChatAndSales'),
        ).toBeInTheDocument()
        expect(getByText('storeSupportWithEmailAndChat')).toBeInTheDocument()
    })
})
