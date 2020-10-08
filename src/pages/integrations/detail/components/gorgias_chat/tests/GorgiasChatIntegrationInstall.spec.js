import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'

import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from '../../../../../../constants/integration.ts'

import configureStore from '../../../../../../store/configureStore'
import ChatIntegrationInstall from '../GorgiasChatIntegrationInstall'
import {renderChatCodeSnippet} from '../renderChatCodeSnippet'

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
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
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
