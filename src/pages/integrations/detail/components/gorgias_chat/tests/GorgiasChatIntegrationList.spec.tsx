import React from 'react'
import {shallow} from 'enzyme'
import {fromJS, Map, List} from 'immutable'

import GorgiasChatIntegrationList from '../GorgiasChatIntegrationList'
import {IntegrationType} from '../../../../../../models/integration/types'

describe('<GorgiasChatIntegrationList/>', () => {
    const mockedActivateIntegration = jest.fn()
    const mockedDeactivateIntegration = jest.fn()
    const props = {
        actions: {
            activateIntegration: mockedActivateIntegration,
            deactivateIntegration: mockedDeactivateIntegration,
        },
        loading: fromJS({}),
        integrations: fromJS([
            {
                id: 1,
                name: 'my chat enabled',
                type: IntegrationType.GorgiasChat,
                meta: {
                    self_service: {
                        enabled: false,
                    },
                    shop_name: 'my associated Shopify store',
                    shop_type: IntegrationType.Shopify,
                },
                decoration: {
                    introduction_text: 'this is an intro',
                    input_placeholder: 'type something please',
                    main_color: '#123456',
                },
            },
            {
                id: 3,
                name: 'my associated Shopify store',
                type: IntegrationType.Shopify,
                meta: {
                    self_service: {
                        enabled: false,
                    },
                },
                decoration: {
                    introduction_text: 'this is an intro',
                    input_placeholder: 'type something please',
                    main_color: '#123456',
                },
                deactivated_datetime: new Date('2020-12-17'),
            },
        ]) as List<Map<any, any>>,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display correcty the list of chat integrations', () => {
        const component = shallow(<GorgiasChatIntegrationList {...props} />)
        expect(component).toMatchSnapshot()
    })

    it('should display associated Shopify store to chat integration', () => {
        const component = shallow(<GorgiasChatIntegrationList {...props} />)
        const shopifyStoreName = component.find('.shopify-store-name')
        expect(shopifyStoreName).toBeDefined()
    })

    it('should display disconnected icon if Shopify store is disconnected', () => {
        const component = shallow(<GorgiasChatIntegrationList {...props} />)
        const isDisconnectedIcon = component.find('#store-disconnected-1')
        expect(isDisconnectedIcon).toBeDefined()
    })
})
