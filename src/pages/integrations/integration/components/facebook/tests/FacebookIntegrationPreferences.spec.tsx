import React, {ComponentProps, SyntheticEvent} from 'react'
import {mount, shallow} from 'enzyme'
import {fromJS, Map} from 'immutable'
import _noop from 'lodash/noop'

import {
    CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
    CHAT_AUTO_RESPONDER_REPLY_IN_DAY,
    CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
} from '../../../../../../config/integrations/index'
import {FACEBOOK_LANGUAGE_DEFAULT} from '../../../../../../config/integrations/facebook'
import {FACEBOOK_INTEGRATION_TYPE} from '../../../../../../constants/integration'
import {FacebookIntegrationPreferences} from '../FacebookIntegrationPreferences'

describe('<FacebookIntegrationPreferences/>', () => {
    const minProps: ComponentProps<typeof FacebookIntegrationPreferences> = {
        updateOrCreateIntegration: jest.fn(),
        integration: fromJS({}),
    }

    describe('componentWillMount()', () => {
        it('should not initialize the state because the passed integration is empty', () => {
            const component = shallow<FacebookIntegrationPreferences>(
                <FacebookIntegrationPreferences {...minProps} />,
                {disableLifecycleMethods: true}
            )

            const prevState = component.state()
            component.instance().componentDidMount()
            expect(component.state()).toEqual(prevState)
        })

        it('should initialize the state because the passed integration is not empty', () => {
            const integration: ComponentProps<
                typeof FacebookIntegrationPreferences
            >['integration'] = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                meta: {
                    language: FACEBOOK_LANGUAGE_DEFAULT,
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
                        },
                    },
                },
            })

            const component = shallow(
                <FacebookIntegrationPreferences
                    {...minProps}
                    integration={integration}
                />
            )

            expect(component.state()).toMatchSnapshot()
        })
    })

    describe('componentDidUpdate()', () => {
        it('should not initialize the state because the passed integration is empty', () => {
            const component = shallow(
                <FacebookIntegrationPreferences {...minProps} />
            )

            const prevState = component.instance()

            component.setProps({integration: fromJS({})})

            expect(component.instance()).toEqual(prevState)
        })

        it('should not initialize the state because it was already initialized', () => {
            const integration: ComponentProps<
                typeof FacebookIntegrationPreferences
            >['integration'] = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                meta: {
                    language: FACEBOOK_LANGUAGE_DEFAULT,
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
                        },
                    },
                },
            })

            const component = shallow(
                <FacebookIntegrationPreferences {...minProps} />
            )

            component.setState({isInitialized: true})
            const prevState = component.state()

            component.setProps({integration})

            expect(component.state()).toEqual(prevState)
        })

        it('should initialize the state because the passed integration is not empty', () => {
            const integration: ComponentProps<
                typeof FacebookIntegrationPreferences
            >['integration'] = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                meta: {
                    language: FACEBOOK_LANGUAGE_DEFAULT,
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
                        },
                    },
                },
            })

            const component = shallow(
                <FacebookIntegrationPreferences {...minProps} />
            )

            component.setProps({integration})

            expect(component.state()).toMatchSnapshot()
        })
    })

    describe('_setAutoResponderEnabled()', () => {
        it('should set passed value in the state', () => {
            const component = shallow<FacebookIntegrationPreferences>(
                <FacebookIntegrationPreferences {...minProps} />
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
            const component = shallow<FacebookIntegrationPreferences>(
                <FacebookIntegrationPreferences {...minProps} />
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
            const component = mount<FacebookIntegrationPreferences>(
                <FacebookIntegrationPreferences {...minProps} />
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

            const component = shallow<FacebookIntegrationPreferences>(
                <FacebookIntegrationPreferences
                    updateOrCreateIntegration={updateOrCreateIntegration}
                    integration={fromJS({type: FACEBOOK_INTEGRATION_TYPE})}
                />
            )

            await component.instance()._submitPreferences({
                preventDefault: _noop,
            } as unknown as SyntheticEvent)

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

            const integration: ComponentProps<
                typeof FacebookIntegrationPreferences
            >['integration'] = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                meta: {
                    preferences: {
                        language: FACEBOOK_LANGUAGE_DEFAULT,
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
                        },
                    },
                },
            })

            const component = shallow<FacebookIntegrationPreferences>(
                <FacebookIntegrationPreferences
                    updateOrCreateIntegration={updateOrCreateIntegration}
                    integration={fromJS(integration)}
                />
            )

            component.setState({
                autoResponderReply: CHAT_AUTO_RESPONDER_REPLY_IN_DAY,
            })

            await component.instance()._submitPreferences({
                preventDefault: _noop,
            } as unknown as SyntheticEvent)

            expect(updateOrCreateIntegration).toHaveBeenCalledWith(
                fromJS({
                    id: integration.get('id'),
                    meta: (integration.get('meta') as Map<any, any>).setIn(
                        ['preferences', 'auto_responder', 'reply'],
                        CHAT_AUTO_RESPONDER_REPLY_IN_DAY
                    ),
                })
            )
        })
    })

    describe('render()', () => {
        it('should render the Facebook preferences', () => {
            const component = shallow(
                <FacebookIntegrationPreferences
                    {...minProps}
                    integration={fromJS({
                        id: 2,
                        type: FACEBOOK_INTEGRATION_TYPE,
                        meta: {language: FACEBOOK_LANGUAGE_DEFAULT},
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render loading buttons because the integration is being updated', () => {
            const component = shallow(
                <FacebookIntegrationPreferences
                    {...minProps}
                    integration={fromJS({
                        id: 2,
                        type: FACEBOOK_INTEGRATION_TYPE,
                        meta: {language: FACEBOOK_LANGUAGE_DEFAULT},
                    })}
                />
            )

            component.setState({isUpdating: true})

            expect(component).toMatchSnapshot()
        })
    })
})
