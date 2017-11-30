import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import RealtimeMessagingIntegrationInstall from './../RealtimeMessagingIntegrationInstall'
import configureStore from './../../../../../store/configureStore'

describe('RealtimeMessagingIntegrationInstall component', () => {
    const minStore = {
        integrations: fromJS({
            integrations: [{
                id: 1,
                name: 'mylittleintegration',
                type: 'shopify'
            }]
        }),
        currentAccount: fromJS({
            domain: 'acme'
        })
    }

    const minProps = {
        store: configureStore(minStore),
        actions: {},
        loading: fromJS({}),
        notify: () => {},
    }

    it('should display the list of Shopify stores without chats', () => {
        const component = shallow(
            <RealtimeMessagingIntegrationInstall
                {...minProps}
                integration={fromJS({
                    id: 2,
                    name: 'mychat',
                    type: 'smooch_inside',
                    meta: {
                        shopify_integration_ids: [2],
                        script_url: 'config.gorgias.io/foo/chat/bar'
                    }
                })}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display a placeholder if there\'s no Shopify store without chat, and' +
        'should display the list of Shopify stores where the chat is installed', () => {
        const component = shallow(
            <RealtimeMessagingIntegrationInstall
                {...minProps}
                integration={fromJS({
                    id: 2,
                    name: 'mychat',
                    type: 'smooch_inside',
                    meta: {
                        shopify_integration_ids: [1],
                        script_url: 'config.gorgias.io/foo/chat/bar'
                    }
                })}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display the code snippet for custom integration', () => {
        const component = shallow(
            <RealtimeMessagingIntegrationInstall
                {...minProps}
                integration={fromJS({
                    id: 2,
                    name: 'mychat',
                    type: 'smooch_inside',
                    decoration: {
                        header_color: '#789456',
                        chat_icon_color: '#AB7891',
                        conversation_color: '#B7B7B7',
                        header_text: 'some window title',
                        introduction_text: 'some introduction text',
                        input_placeholder: 'type here to send messages',
                        send_button_text: 'Lets goooo'
                    },
                    meta: {
                        app_token: 'a86sd47a56sd4asd',
                        script_url: 'config.gorgias.io/foo/chat/bar'
                    }
                })}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })
})
