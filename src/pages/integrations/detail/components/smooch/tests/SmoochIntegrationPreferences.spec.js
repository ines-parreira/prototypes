import React from 'react'
import {mount, shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {
    CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
    CHAT_AUTO_RESPONDER_REPLY_IN_DAY,
    CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
} from '../../../../../../config/integrations'
import {SMOOCH_LANGUAGE_DEFAULT} from '../../../../../../config/integrations/smooch'
import {SMOOCH_INTEGRATION_TYPE} from '../../../../../../constants/integration'
import {SmoochIntegrationPreferences} from '../SmoochIntegrationPreferences'

describe('<SmoochIntegrationPreferences/>', () => {
    describe('componentWillMount()', () => {
        it('should not initialize the state because the passed integration is empty', () => {
            const component = shallow(
                <SmoochIntegrationPreferences
                    updateOrCreateIntegration={() => {}}
                    integration={fromJS({})}
                />,
                {disableLifecycleMethods: true}
            )

            const prevState = component.state()
            component.instance().componentDidMount()
            expect(component.state()).toEqual(prevState)
        })

        it('should initialize the state because the passed integration is not empty', () => {
            const integration = fromJS({
                id: 1,
                type: SMOOCH_INTEGRATION_TYPE,
                meta: {
                    language: SMOOCH_LANGUAGE_DEFAULT,
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
                        },
                    },
                },
            })

            const component = shallow(
                <SmoochIntegrationPreferences
                    updateOrCreateIntegration={() => {}}
                    integration={integration}
                />
            )

            expect(component.state()).toMatchSnapshot()
        })
    })

    describe('componentDidUpdate()', () => {
        it('should not initialize the state because the passed integration is empty', () => {
            const component = shallow(
                <SmoochIntegrationPreferences
                    updateOrCreateIntegration={() => {}}
                    integration={fromJS({})}
                />
            )

            const prevState = component.state()

            component.setProps({integration: fromJS({})})

            expect(component.state()).toEqual(prevState)
        })

        it('should not initialize the state because it was already initialized', () => {
            const integration = fromJS({
                id: 1,
                type: SMOOCH_INTEGRATION_TYPE,
                meta: {
                    language: SMOOCH_LANGUAGE_DEFAULT,
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
                        },
                    },
                },
            })

            const component = shallow(
                <SmoochIntegrationPreferences
                    updateOrCreateIntegration={() => {}}
                    integration={fromJS({})}
                />
            )

            component.setState({isInitialized: true})
            const prevState = component.state()

            component.setProps({integration})

            expect(component.state()).toEqual(prevState)
        })

        it('should initialize the state because the passed integration is not empty', () => {
            const integration = fromJS({
                id: 1,
                type: SMOOCH_INTEGRATION_TYPE,
                meta: {
                    language: SMOOCH_LANGUAGE_DEFAULT,
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
                        },
                    },
                },
            })

            const component = shallow(
                <SmoochIntegrationPreferences
                    updateOrCreateIntegration={() => {}}
                    integration={fromJS({})}
                />
            )

            component.setProps({integration})

            expect(component.state()).toMatchSnapshot()
        })
    })

    describe('_setAutoResponderEnabled()', () => {
        it('should set passed value in the state', () => {
            const component = shallow(
                <SmoochIntegrationPreferences
                    updateOrCreateIntegration={() => {}}
                    integration={fromJS({})}
                />
            )

            expect(component.state('autoResponderEnabled')).toEqual(
                CHAT_AUTO_RESPONDER_ENABLED_DEFAULT
            )

            component
                .instance()
                ._setAutoResponderEnabled(!CHAT_AUTO_RESPONDER_ENABLED_DEFAULT)

            expect(component.state('autoResponderEnabled')).toEqual(
                !CHAT_AUTO_RESPONDER_ENABLED_DEFAULT
            )
        })
    })

    describe('_setAutoResponderReply()', () => {
        it('should set passed value in the state', () => {
            const component = shallow(
                <SmoochIntegrationPreferences
                    updateOrCreateIntegration={() => {}}
                    integration={fromJS({})}
                />
            )

            expect(component.state('autoResponderReply')).toEqual(
                CHAT_AUTO_RESPONDER_REPLY_DEFAULT
            )

            component
                .instance()
                ._setAutoResponderReply(CHAT_AUTO_RESPONDER_REPLY_IN_DAY)

            expect(component.state('autoResponderReply')).toEqual(
                CHAT_AUTO_RESPONDER_REPLY_IN_DAY
            )
        })
    })

    describe('_submitPreferences()', () => {
        it('should be called when the form is submitted', () => {
            const component = mount(
                <SmoochIntegrationPreferences
                    updateOrCreateIntegration={() => {}}
                    integration={fromJS({})}
                />
            )

            const submitPreferencesSpy = jest.spyOn(
                component.instance(),
                '_submitPreferences'
            )
            component.instance().forceUpdate()
            component.find('form').simulate('submit')

            expect(submitPreferencesSpy).toHaveBeenCalledTimes(1)
        })

        it('should submit the form with defaults', async () => {
            const updateOrCreateIntegration = jest.fn()

            const component = shallow(
                <SmoochIntegrationPreferences
                    updateOrCreateIntegration={updateOrCreateIntegration}
                    integration={fromJS({})}
                />
            )

            await component
                .instance()
                ._submitPreferences({preventDefault: () => {}})

            expect(updateOrCreateIntegration).toHaveBeenCalledWith(
                fromJS({
                    id: undefined,
                    meta: {
                        preferences: {
                            auto_responder: {
                                enabled: CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
                                reply: CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
                            },
                        },
                    },
                })
            )
        })

        it('should submit the form with loaded values', async () => {
            const updateOrCreateIntegration = jest.fn()

            const integration = fromJS({
                id: 1,
                type: SMOOCH_INTEGRATION_TYPE,
                meta: {
                    language: SMOOCH_LANGUAGE_DEFAULT,
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
                        },
                    },
                },
            })

            const component = shallow(
                <SmoochIntegrationPreferences
                    updateOrCreateIntegration={updateOrCreateIntegration}
                    integration={integration}
                />
            )

            component.setState({
                autoResponderReply: CHAT_AUTO_RESPONDER_REPLY_IN_DAY,
            })

            await component
                .instance()
                ._submitPreferences({preventDefault: () => {}})

            expect(updateOrCreateIntegration).toHaveBeenCalledWith(
                fromJS({
                    id: integration.get('id'),
                    meta: integration
                        .get('meta')
                        .setIn(
                            ['preferences', 'auto_responder', 'reply'],
                            CHAT_AUTO_RESPONDER_REPLY_IN_DAY
                        ),
                })
            )
        })
    })

    describe('render()', () => {
        it('should render the Smooch preferences', () => {
            const component = shallow(
                <SmoochIntegrationPreferences
                    updateOrCreateIntegration={() => {}}
                    integration={fromJS({
                        id: 2,
                        type: SMOOCH_INTEGRATION_TYPE,
                        meta: {language: SMOOCH_LANGUAGE_DEFAULT},
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render loading buttons because the integration is being updated', () => {
            const component = shallow(
                <SmoochIntegrationPreferences
                    updateOrCreateIntegration={() => {}}
                    integration={fromJS({
                        id: 2,
                        type: SMOOCH_INTEGRATION_TYPE,
                        meta: {language: SMOOCH_LANGUAGE_DEFAULT},
                    })}
                />
            )

            component.setState({isUpdating: true})

            expect(component).toMatchSnapshot()
        })
    })
})
