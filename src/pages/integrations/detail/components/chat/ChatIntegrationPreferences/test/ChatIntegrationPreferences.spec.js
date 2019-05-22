import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_DEFAULT,
    SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT
} from '../../../../../../../config/integrations/chat'
import {SMOOCH_INSIDE_INTEGRATION_TYPE} from '../../../../../../../constants/integration'
import ChatIntegrationPreferences from '../ChatIntegrationPreferences'


const mockStore = configureMockStore([thunk])


describe('ChatIntegrationPreferences component', () => {
    it('should render the chat settings container', () => {
        const component = mount(
            <ChatIntegrationPreferences
                store={mockStore({})}
                integration={fromJS({
                    id: 2,
                    type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                    meta: {
                        language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT
                    },
                    decoration: {
                        main_color: '#789c5d',
                        conversation_color: '#08d123'
                    }
                })}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should set autoResponderEnabled value', () => {
        const component = mount(
            <ChatIntegrationPreferences
                store={mockStore({})}
                integration={fromJS({
                    id: 2,
                    meta: {
                        preferences: {
                            auto_responder: {
                                enabled: true
                            }
                        },
                        language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT
                    }
                })}
            />
        )
        expect(component.find('input#id-autoResponderEnabled').props().checked).toBe(true)
    })

    it('should set autoResponderText value', () => {
        const autoResponderText = 'Pizza Pepperoni'
        const component = mount(
            <ChatIntegrationPreferences
                store={mockStore({})}
                integration={fromJS({
                    id: 2,
                    meta: {
                        preferences: {
                            auto_responder: {
                                text: autoResponderText
                            }
                        },
                        language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT
                    }
                })}
            />
        )
        expect(component.find('textarea#id-autoResponderText').props().value).toBe(autoResponderText)
    })

    it('should submit the form with defaults', () => {
        const store = mockStore({})

        const integration = {
            id: undefined,
            meta: {
                language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
                preferences: {
                    auto_responder: {
                        enabled: false,
                        text: 'We\'re away at the moment. Leave us your email and we\'ll follow up shortly.',
                    },
                    email_capture_enforcement: SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_DEFAULT
                }
            }
        }

        const component = mount(
            <ChatIntegrationPreferences
                store={store}
                integration={fromJS({
                    type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                    meta: {
                        language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT
                    }
                })}
            />
        )

        component.find('form').simulate('submit')

        const actions = store.getActions()
        expect(actions.length).toBe(1)

        const action = actions[0]

        expect(action.integration.toJS()).toEqual(integration)
    })

    it('should submit the form with loaded values', () => {
        const store = mockStore({})

        const integration = {
            id: 1,
            type: SMOOCH_INSIDE_INTEGRATION_TYPE,
            meta: {
                preferences: {
                    auto_responder: {
                        customProperty: 'Pizza Pepperoni',
                        enabled: true,
                        text: 'Pizza Pepperoni',
                    },
                    email_capture_enforcement: SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_DEFAULT
                },
                language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT
            }
        }

        const component = mount(
            <ChatIntegrationPreferences
                store={store}
                integration={fromJS(integration)}
            />
        )

        component.find('form').simulate('submit')

        const actions = store.getActions()
        expect(actions.length).toBe(1)

        const action = actions[0]

        delete integration.type

        expect(action.integration.toJS()).toEqual(integration)
    })
})
