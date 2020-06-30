import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'

import {
    SHOPIFY_INTEGRATION_TYPE,
    SMOOCH_INSIDE_INTEGRATION_TYPE,
} from '../../../../../../../constants/integration'

import configureStore from '../../../../../../../store/configureStore'
import ChatIntegrationInstall from '../ChatIntegrationInstall'

describe('ChatIntegrationInstall component', () => {
    const minStore = {
        integrations: fromJS({
            integrations: [
                {
                    id: 1,
                    name: 'mylittleintegration',
                    type: SHOPIFY_INTEGRATION_TYPE,
                    created_datetime: '2018-01-01 00:00:00',
                },
                {
                    id: 3,
                    name: 'mylittleintegration2',
                    type: SHOPIFY_INTEGRATION_TYPE,
                    created_datetime: '2019-01-01 00:00:00',
                },
            ],
        }),
        currentAccount: fromJS({
            domain: 'acme',
        }),
    }

    const minProps = {
        store: configureStore(minStore),
        actions: {},
        loading: fromJS({}),
        notify: () => {},
    }

    it('should display the list of Shopify stores with the toggle checked or not depending on the installation status', () => {
        const component = mount(
            <ChatIntegrationInstall
                {...minProps}
                integration={fromJS({
                    id: 2,
                    name: 'mychat',
                    type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                    meta: {
                        shopify_integration_ids: [3],
                        script_url: 'config.gorgias.io/foo/chat/bar',
                    },
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
