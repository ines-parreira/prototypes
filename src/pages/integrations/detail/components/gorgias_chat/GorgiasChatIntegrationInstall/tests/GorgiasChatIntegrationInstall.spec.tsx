import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'

import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from '../../../../../../../constants/integration'
import configureStore from '../../../../../../../store/configureStore.js'
import GorgiasChatIntegrationInstall from '../GorgiasChatIntegrationInstall'
import {renderChatCodeSnippet} from '../../renderChatCodeSnippet.js'

describe('renderChatCodeSnippet()', () => {
    it('should render correctly with new format', () => {
        const integration = fromJS({
            decoration: {
                icon: 'http://iconurl.com/',
                header_color: '#789456',
                chat_icon_color: '#213456',
                conversation_color: '#741852',
                header_text: 'foo',
                introduction_text: 'bar',
                input_placeholder: 'placeholder',
                send_button_text: 'send!',
            },
            meta: {
                app_token: 'apijdasoidkas',
                script_url: 'config.gorgias.io/foo/chat/bar.js',
            },
        })

        expect(renderChatCodeSnippet(integration)).toMatchSnapshot()
    })
})

describe('<GorgiasChatIntegrationInstall/>', () => {
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
                    id: 2,
                    name: 'mylittleintegration2',
                    type: SHOPIFY_INTEGRATION_TYPE,
                    created_datetime: '2019-01-01 00:00:00',
                },
                {
                    id: 3,
                    name: 'mylittleintegration3',
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
        actions: {
            updateOrCreateIntegration: jest.fn(() => Promise.resolve()),
        },
        loading: fromJS({}),
        notify: jest.fn(),
    }

    it('should display the associated Shopify store when shop_name and shop_type are defined and installed in shopify_integration_ids', () => {
        const component = mount(
            <GorgiasChatIntegrationInstall
                {...minProps}
                integration={fromJS({
                    id: 2,
                    name: 'mychat',
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    meta: {
                        shop_name: 'mylittleintegration3',
                        shop_type: SHOPIFY_INTEGRATION_TYPE,
                        shopify_integration_ids: [3],
                        script_url: 'config.gorgias.io/foo/chat/bar',
                    },
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display a list of Shopify store if the chat as multiple shopify_integration_ids', () => {
        const div = document.createElement('div')
        document.body.appendChild(div)
        const component = mount(
            <GorgiasChatIntegrationInstall
                {...minProps}
                integration={fromJS({
                    id: 2,
                    name: 'mychat',
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    meta: {
                        shopify_integration_ids: [1, 2, 3],
                        script_url: 'config.gorgias.io/foo/chat/bar',
                    },
                })}
            />,
            {attachTo: div}
        )

        expect(component).toMatchSnapshot()
    })

    it('should display the Custom installation block if shop_name & shop_type are not set and there is no shopify_integration_ids', () => {
        const component = mount(
            <GorgiasChatIntegrationInstall
                {...minProps}
                integration={fromJS({
                    id: 2,
                    name: 'mychat',
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    meta: {
                        shopify_integration_ids: [],
                        script_url: 'config.gorgias.io/foo/chat/bar',
                    },
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
