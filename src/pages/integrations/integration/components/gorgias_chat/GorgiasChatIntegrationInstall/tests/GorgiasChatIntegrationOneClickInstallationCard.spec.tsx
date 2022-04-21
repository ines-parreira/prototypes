import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import {fromJS, Map} from 'immutable'

import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from '../../../../../../../constants/integration'

import GorgiasChatIntegrationOneClickInstallationCard from '../GorgiasChatIntegrationOneClickInstallationCard'

describe('<GorgiasChatIntegrationOneClickInstallationCard/>', () => {
    const mockedUpdateOrCreateIntegration = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display one shopify integration and call updateOrCreateIntegration with uninstall arguments', () => {
        const chatIntegration: Map<any, any> = fromJS({
            id: 1,
            name: 'mychat',
            type: GORGIAS_CHAT_INTEGRATION_TYPE,
            meta: {
                shop_name: 'mylittleintegration3',
                shop_type: SHOPIFY_INTEGRATION_TYPE,
                shopify_integration_ids: [3],
                script_url: 'config.gorgias.io/foo/chat/bar',
            },
        })

        const {container} = render(
            <GorgiasChatIntegrationOneClickInstallationCard
                integration={chatIntegration}
                updateOrCreateIntegration={mockedUpdateOrCreateIntegration}
                shopifyIntegrations={fromJS([
                    {
                        id: 3,
                        name: 'mylittleintegration3',
                        type: SHOPIFY_INTEGRATION_TYPE,
                        created_datetime: '2019-01-01 00:00:00',
                    },
                ])}
                hasAutomationAddOn={true}
            />
        )
        expect(container).toMatchSnapshot()

        const uninstallButton = screen.getByText(/Uninstall/)
        fireEvent.click(uninstallButton)

        const meta: Map<any, any> = chatIntegration.get('meta')
        const updatedMeta: Map<any, any> = meta.deleteIn([
            'shopify_integration_ids',
            0,
        ])

        expect(mockedUpdateOrCreateIntegration).toHaveBeenCalledWith(
            fromJS({
                id: 1,
                type: GORGIAS_CHAT_INTEGRATION_TYPE,
                meta: updatedMeta,
            })
        )
    })

    it('should display one shopify integration and call updateOrCreateIntegration with disconnect arguments', () => {
        const chatIntegration: Map<any, any> = fromJS({
            id: 1,
            name: 'mychat',
            type: GORGIAS_CHAT_INTEGRATION_TYPE,
            meta: {
                shop_name: 'mylittleintegration3',
                shop_type: SHOPIFY_INTEGRATION_TYPE,
                shopify_integration_ids: [3],
                script_url: 'config.gorgias.io/foo/chat/bar',
            },
        })

        const {container} = render(
            <GorgiasChatIntegrationOneClickInstallationCard
                integration={chatIntegration}
                updateOrCreateIntegration={mockedUpdateOrCreateIntegration}
                shopifyIntegrations={fromJS([
                    {
                        id: 3,
                        name: 'mylittleintegration3',
                        type: SHOPIFY_INTEGRATION_TYPE,
                        created_datetime: '2019-01-01 00:00:00',
                    },
                ])}
                hasAutomationAddOn={true}
            />
        )

        const disconnectButton = container.querySelector(`#disconnect-button-3`)
        if (!disconnectButton) {
            fail()
        }

        fireEvent.click(disconnectButton)

        const confirmButton = screen.getByText(/confirm/i)

        fireEvent.click(confirmButton)

        const meta: Map<any, any> = chatIntegration.get('meta')
        const updatedMeta: Map<any, any> = meta
            .deleteIn(['shopify_integration_ids', 0])
            .set('shop_name', null)
            .set('shop_type', null)
            .set('shop_integration_id', null)
            .set('shopify_integration_ids', [])

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const param = mockedUpdateOrCreateIntegration.mock.calls[0][0] as Map<
            any,
            any
        >

        expect(param.toJS()).toEqual({
            id: 1,
            type: 'gorgias_chat',
            meta: {
                ...updatedMeta.toJS(),
                self_service_deactivated_datetime: expect.any(String),
            },
        })
    })

    it('should display one shopify integration and call updateOrCreateIntegration with install arguments', () => {
        const chatIntegration: Map<any, any> = fromJS({
            id: 1,
            name: 'mychat',
            type: GORGIAS_CHAT_INTEGRATION_TYPE,
            meta: {
                shop_name: 'mylittleintegration3',
                shop_type: SHOPIFY_INTEGRATION_TYPE,
                shopify_integration_ids: [],
                script_url: 'config.gorgias.io/foo/chat/bar',
            },
        })

        const {container} = render(
            <GorgiasChatIntegrationOneClickInstallationCard
                integration={chatIntegration}
                updateOrCreateIntegration={mockedUpdateOrCreateIntegration}
                shopifyIntegrations={fromJS([
                    {
                        id: 3,
                        name: 'mylittleintegration3',
                        type: SHOPIFY_INTEGRATION_TYPE,
                        created_datetime: '2019-01-01 00:00:00',
                    },
                ])}
                hasAutomationAddOn={true}
            />
        )
        expect(container).toMatchSnapshot()

        const installButton = screen.getByText(/Install/)
        fireEvent.click(installButton)

        const meta: Map<any, any> = chatIntegration.get('meta')
        const updatedMeta: Map<any, any> = meta.set(
            'shopify_integration_ids',
            fromJS([3])
        )

        expect(mockedUpdateOrCreateIntegration).toHaveBeenCalledWith(
            fromJS({
                id: 1,
                type: GORGIAS_CHAT_INTEGRATION_TYPE,
                meta: updatedMeta,
            })
        )
    })

    const defaultShopifyIntegration = fromJS([
        {
            id: 3,
            name: 'mylittleintegration3',
            type: SHOPIFY_INTEGRATION_TYPE,
            created_datetime: '2019-01-01 00:00:00',
        },
    ])

    it('should NOT display the message "Note that this will automatically enable Self-Service"', () => {
        const chatIntegration: Map<any, any> = fromJS({
            id: 1,
            name: 'mychat',
            type: GORGIAS_CHAT_INTEGRATION_TYPE,
            meta: {
                shop_name: 'mylittleintegration3',
                shop_type: SHOPIFY_INTEGRATION_TYPE,
                shopify_integration_ids: [],
                script_url: 'config.gorgias.io/foo/chat/bar',
            },
        })

        const {container} = render(
            <GorgiasChatIntegrationOneClickInstallationCard
                integration={chatIntegration}
                updateOrCreateIntegration={mockedUpdateOrCreateIntegration}
                shopifyIntegrations={defaultShopifyIntegration}
                hasAutomationAddOn={false}
            />
        )

        expect(container).toMatchSnapshot()
        expect(container.querySelector('.card-body > p')?.textContent).toBe(
            'Activate the customer chat widget on your Shopify store in one click.'
        )
    })

    it('should display the message "Note that this will automatically enable Self-Service"', () => {
        const chatIntegration: Map<any, any> = fromJS({
            id: 1,
            name: 'mychat',
            type: GORGIAS_CHAT_INTEGRATION_TYPE,
            meta: {
                shop_name: 'mylittleintegration3',
                shop_type: SHOPIFY_INTEGRATION_TYPE,
                shopify_integration_ids: [],
                script_url: 'config.gorgias.io/foo/chat/bar',
            },
        })

        const {container} = render(
            <GorgiasChatIntegrationOneClickInstallationCard
                integration={chatIntegration}
                updateOrCreateIntegration={mockedUpdateOrCreateIntegration}
                shopifyIntegrations={defaultShopifyIntegration}
                hasAutomationAddOn={true}
            />
        )

        expect(container).toMatchSnapshot()
        expect(container.querySelector('.card-body > p')?.textContent).toBe(
            'Activate the customer chat widget on your Shopify store in one click. Note that this will automatically enable Self-Service.'
        )
    })
})
