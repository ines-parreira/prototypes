import React from 'react'

import { fireEvent, render } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'

import { AiAgentScope } from 'models/aiAgent/types'
import { StoreConfigurationForActivation } from 'pages/aiAgent/Activation/hooks/useStoreActivations'

import { AiAgentActivationModal } from '../AiAgentActivationModal'

const storeSupportWithEmailAndChatAndSales: StoreConfigurationForActivation = {
    storeName: 'storeSupportWithEmailAndChatAndSales',
    scopes: [AiAgentScope.Support, AiAgentScope.Sales],
    chatChannelDeactivatedDatetime: null,
    emailChannelDeactivatedDatetime: null,
    monitoredChatIntegrations: [1],
    monitoredEmailIntegrations: [{ id: 2, email: 'foo@example.com' }],
}

const storeSupportWithEmailAndChat: StoreConfigurationForActivation = {
    storeName: 'storeSupportWithEmailAndChat',
    scopes: [AiAgentScope.Support],
    chatChannelDeactivatedDatetime: null,
    emailChannelDeactivatedDatetime: null,
    monitoredChatIntegrations: [1],
    monitoredEmailIntegrations: [{ id: 2, email: 'foo@example.com' }],
}

describe('<AiAgentActivationModal />', () => {
    it('should render the modal with correct title and progress', () => {
        const onCloseMock = jest.fn()
        const onToggleSalesMock = jest.fn()
        const onToggleSupportMock = jest.fn()
        const onToggleSupportChatMock = jest.fn()
        const onToggleSupportEmailMock = jest.fn()
        const { getByText } = render(
            <AiAgentActivationModal
                isOpen
                onClose={onCloseMock}
                storeConfigs={[
                    storeSupportWithEmailAndChatAndSales,
                    storeSupportWithEmailAndChat,
                ]}
                onToggleSales={onToggleSalesMock}
                onToggleSupport={onToggleSupportMock}
                onToggleSupportChat={onToggleSupportChatMock}
                onToggleSupportEmail={onToggleSupportEmailMock}
            />,
        )

        expect(getByText('Manage AI Agent Activation')).toBeInTheDocument()
        expect(
            getByText('storeSupportWithEmailAndChatAndSales'),
        ).toBeInTheDocument()
        expect(getByText('storeSupportWithEmailAndChat')).toBeInTheDocument()
    })

    it('should trigger all toggle functions when toggled', () => {
        const onCloseMock = jest.fn()
        const onToggleSalesMock = jest.fn()
        const onToggleSupportMock = jest.fn()
        const onToggleSupportChatMock = jest.fn()
        const onToggleSupportEmailMock = jest.fn()

        const { getByText } = render(
            <AiAgentActivationModal
                isOpen
                onClose={onCloseMock}
                storeConfigs={[storeSupportWithEmailAndChatAndSales]}
                onToggleSales={onToggleSalesMock}
                onToggleSupport={onToggleSupportMock}
                onToggleSupportChat={onToggleSupportChatMock}
                onToggleSupportEmail={onToggleSupportEmailMock}
            />,
        )

        const toggleSupport = getByText('Support', { exact: true }).nextSibling
            ?.firstChild?.firstChild!
        expect(toggleSupport).toBeInTheDocument()
        fireEvent.click(toggleSupport)
        expect(onToggleSupportMock).toHaveBeenCalledWith(
            'storeSupportWithEmailAndChatAndSales',
            false,
        )

        const toggleSales = getByText('Sales', { exact: true }).nextSibling
            ?.firstChild?.firstChild!
        expect(toggleSales).toBeInTheDocument()
        fireEvent.click(toggleSales)
        expect(onToggleSalesMock).toHaveBeenCalledWith(
            'storeSupportWithEmailAndChatAndSales',
            false,
        )
    })
})
