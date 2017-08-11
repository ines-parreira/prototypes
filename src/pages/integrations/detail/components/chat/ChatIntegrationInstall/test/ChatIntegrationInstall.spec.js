import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import ChatIntegrationInstall from './../ChatIntegrationInstall'
import configureStore from './../../../../../../../store/configureStore'

describe('ChatIntegrationInstall component', () => {
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
            <ChatIntegrationInstall
                {...minProps}
                integration={fromJS({
                    id: 2,
                    name: 'mychat',
                    type: 'smooch_inside',
                    meta: {
                        shopify_integration_ids: [2]
                    }
                })}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display a placeholder if there\'s no Shopify store without chat', () => {
        const component = shallow(
            <ChatIntegrationInstall
                {...minProps}
                integration={fromJS({
                    id: 2,
                    name: 'mychat',
                    type: 'smooch_inside',
                    meta: {
                        shopify_integration_ids: [1]
                    }
                })}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display the code snippet for custom integration', () => {
        const component = shallow(
            <ChatIntegrationInstall
                {...minProps}
                integration={fromJS({
                    id: 2,
                    name: 'mychat',
                    type: 'smooch_inside',
                    decoration: {
                        header_color: '#789456',
                        chat_icon_color: '#AB7891',
                        conversation_color: '#B7B7B7',
                        window_title: 'some window title',
                        header_text: 'some introduction text',
                        input_placeholder: 'type here to send messages',
                        send_button_text: 'Lets goooo'
                    },
                    meta: {
                        app_token: 'a86sd47a56sd4asd',
                    }
                })}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })
})
