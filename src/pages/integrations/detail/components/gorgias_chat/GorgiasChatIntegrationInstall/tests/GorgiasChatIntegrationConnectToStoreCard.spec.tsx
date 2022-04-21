import React from 'react'
import {fromJS, Map} from 'immutable'
import {render, fireEvent} from '@testing-library/react'

import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from '../../../../../../../constants/integration'
import {GorgiasChatIntegrationConnectToStoreCard} from '../GorgiasChatIntegrationConnectToStoreCard'

describe('<GorgiasChatIntegrationConnectToStoreCard/>', () => {
    const mockedUpdateOrCreateIntegration = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()
    })
    it('should render the component correctly', () => {
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
            <GorgiasChatIntegrationConnectToStoreCard
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
                gorgiasChatIntegrations={fromJS([
                    {
                        id: 4,
                        name: 'mylittleintegration4',
                        type: GORGIAS_CHAT_INTEGRATION_TYPE,
                        created_datetime: '2019-01-01 00:00:00',
                    },
                ])}
            />
        )
        expect(container).toMatchSnapshot()
    })

    it('should call the updateOrCreateIntegration function when connecting a store', () => {
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
        const {getByRole} = render(
            <GorgiasChatIntegrationConnectToStoreCard
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
                gorgiasChatIntegrations={fromJS([
                    {
                        id: 4,
                        name: 'mylittleintegration4',
                        type: GORGIAS_CHAT_INTEGRATION_TYPE,
                        created_datetime: '2019-01-01 00:00:00',
                    },
                ])}
            />
        )

        const connectButton = getByRole('button', {name: /connect/i})
        fireEvent.click(connectButton)

        const selectButton = getByRole('button', {name: /shopifyStore/i})
        fireEvent.click(selectButton)

        const shopButton = getByRole('menuitem', {
            name: /shopifyStore/i,
        })
        fireEvent.click(shopButton)

        const connectAndInstallButton = getByRole('button', {
            name: /connect & install/i,
        })
        fireEvent.click(connectAndInstallButton)

        const meta: Map<any, any> = chatIntegration.get('meta')
        const updatedMeta: Map<any, any> = meta
            .set('shop_name', 'mylittleintegration3')
            .set('shop_type', SHOPIFY_INTEGRATION_TYPE)
            .set('shop_integration_id', 3)
            .set('shopify_integration_ids', [3])
            .set('self_service_deactivated_datetime', null)

        expect(mockedUpdateOrCreateIntegration).toHaveBeenCalledWith(
            fromJS({
                id: 1,
                type: GORGIAS_CHAT_INTEGRATION_TYPE,
                meta: updatedMeta,
            })
        )
    })
})
