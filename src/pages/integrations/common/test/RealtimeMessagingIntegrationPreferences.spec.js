import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const mockStore = configureMockStore([thunk])


import RealtimeMessagingIntegrationPreferences from '../RealtimeMessagingIntegrationPreferences'

describe('RealtimeMessagingIntegrationPreferences component', () => {

    it('should render the chat settings container', () => {
        const component = mount(
            <RealtimeMessagingIntegrationPreferences
                store={mockStore({})}
                integration={fromJS({
                    id: 2,
                    type: 'smooch_inside'
                })}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should not render emailCapture if the integration is of type Facebook', () => {
        const component = mount(
            <RealtimeMessagingIntegrationPreferences
                store={mockStore({})}
                integration={fromJS({
                    id: 2,
                    type: 'facebook'
                })}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should not render emailCapture if the integration is of type Smooch', () => {
        const component = mount(
            <RealtimeMessagingIntegrationPreferences
                store={mockStore({})}
                integration={fromJS({
                    id: 2,
                    type: 'smooch'
                })}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should set autoResponderEnabled value', () => {
        const component = mount(
            <RealtimeMessagingIntegrationPreferences
                store={mockStore({})}
                integration={fromJS({
                    id: 2,
                    meta: {
                        preferences: {
                            auto_responder: {
                                enabled: true
                            }
                        }
                    }
                })}
            />
        )
        expect(component.find('input#id-autoResponderEnabled').props().checked).toBe(true)
    })

    it('should set autoResponderText value', () => {
        const autoResponderText = 'Pizza Pepperoni'
        const component = mount(
            <RealtimeMessagingIntegrationPreferences
                store={mockStore({})}
                integration={fromJS({
                    id: 2,
                    meta: {
                        preferences: {
                            auto_responder: {
                                text: autoResponderText
                            }
                        }
                    }
                })}
            />
        )
        expect(component.find('textarea#id-autoResponderText').props().value).toBe(autoResponderText)
    })

    it('should set timeBeforeSplit value', () => {
        const timeBeforeSplit = 1
        const component = mount(
            <RealtimeMessagingIntegrationPreferences
                store={mockStore({})}
                integration={fromJS({
                    id: 2,
                    meta: {
                        preferences: {
                            time_before_split: timeBeforeSplit
                        }
                    }
                })}
            />
        )
        expect(component.find('select#id-timeBeforeSplit').props().value).toBe(timeBeforeSplit)
    })

    it('should submit the form with defaults', () => {
        const store = mockStore({})

        const integration = {
            id: undefined,
            meta: {
                preferences: {
                    auto_responder: {
                        enabled: false,
                        text: 'We\'re away at the moment. Leave us your email and we\'ll follow up shortly.',
                    },
                    time_before_split: 3 * 60 * 60,
                    email_capture: {
                        enabled: false,
                        online: {
                            trigger_text: 'Leave us your email in case we reply later.',
                            thanks_text: 'Thanks! We\'ll email you at {email} if you leave.',
                        },
                        offline: {
                            trigger_text: 'We\'re away, leave us your email and we\'ll respond shortly.',
                            thanks_text: 'Thanks {email}! We\'ll get back to you shortly.',
                        }
                    },
                }
            }
        }

        const component = mount(
            <RealtimeMessagingIntegrationPreferences
                store={store}
                integration={fromJS({type: 'smooch_inside'})}
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
            type: 'smooch_inside',
            meta: {
                preferences: {
                    auto_responder: {
                        customProperty: 'Pizza Pepperoni',
                        enabled: true,
                        text: 'Pizza Pepperoni',
                    },
                    time_before_split: 1,
                    email_capture: {
                        enabled: false,
                        online: {
                            trigger_text: 'foo',
                            thanks_text: 'bar',
                        },
                        offline: {
                            trigger_text: 'baz',
                            thanks_text: 'boo',
                        }
                    },
                }
            }
        }

        const component = mount(
            <RealtimeMessagingIntegrationPreferences
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
