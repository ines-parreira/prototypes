import React from 'react'

import { fireEvent, render } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'

import { AiAgentScope } from 'models/aiAgent/types'

import { AiAgentActivationModal } from '../AiAgentActivationModal'

const mockStoreConfigs: any[] = [
    {
        storeName: 'Store1',
        scopes: [AiAgentScope.Sales, AiAgentScope.Support],
        chatChannelDeactivatedDatetime: null,
        emailChannelDeactivatedDatetime: null,
        monitoredChatIntegrations: [],
        monitoredEmailIntegrations: [],
    },
    {
        storeName: 'Store2',
        scopes: [AiAgentScope.Sales],
        chatChannelDeactivatedDatetime: new Date().toISOString(),
        emailChannelDeactivatedDatetime: new Date().toISOString(),
        monitoredChatIntegrations: [],
        monitoredEmailIntegrations: [],
    },
]

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
                storeConfigs={mockStoreConfigs}
                onToggleSales={onToggleSalesMock}
                onToggleSupport={onToggleSupportMock}
                onToggleSupportChat={onToggleSupportChatMock}
                onToggleSupportEmail={onToggleSupportEmailMock}
            />,
        )

        expect(getByText('Manage AI Agent Activation')).toBeInTheDocument()
        expect(getByText('Store1')).toBeInTheDocument()
        expect(getByText('Store2')).toBeInTheDocument()
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
                storeConfigs={[mockStoreConfigs[0]]}
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

        const toggleSales = getByText('Sales', { exact: true }).nextSibling
            ?.firstChild?.firstChild!
        expect(toggleSales).toBeInTheDocument()
        fireEvent.click(toggleSales)

        expect(onToggleSalesMock).toHaveBeenCalledWith('Store1', false)
        expect(onToggleSupportMock).toHaveBeenCalledWith('Store1', false)
    })
})
