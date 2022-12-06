import React, {ComponentProps, SyntheticEvent} from 'react'
import {mount, shallow} from 'enzyme'
import {fromJS, Map} from 'immutable'
import _noop from 'lodash/noop'

import {
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
} from 'config/integrations/gorgias_chat'
import {
    CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
    CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
} from 'config/integrations/index'
import {GORGIAS_CHAT_INTEGRATION_TYPE} from 'constants/integration'
import {SPANISH_LANGUAGE} from 'constants/languages'

import {
    GorgiasChatIntegrationPreferencesComponent,
    PREVIEW_AUTO_RESPONDER,
    PREVIEW_EMAIL_CAPTURE,
    PREVIEW_LIVE_CHAT_AVAILABILITY,
} from '../GorgiasChatIntegrationPreferences'

describe('<GorgiasChatIntegrationPreferences/>', () => {
    const minProps: ComponentProps<
        typeof GorgiasChatIntegrationPreferencesComponent
    > = {
        integration: fromJS({}),
        emailIntegrations: [],
        updateOrCreateIntegration: jest.fn(),
    }

    describe('componentDidMount()', () => {
        it('should not initialize the state because the passed integration is empty', () => {
            const component =
                shallow<GorgiasChatIntegrationPreferencesComponent>(
                    <GorgiasChatIntegrationPreferencesComponent
                        {...minProps}
                    />,
                    {disableLifecycleMethods: true}
                )

            const prevState = component.state()
            component.instance().componentDidMount()
            expect(component.state()).toEqual(prevState)
        })

        it('should initialize the state using the integration passed', () => {
            const integration: Map<any, any> = fromJS({
                id: 1,
                type: GORGIAS_CHAT_INTEGRATION_TYPE,
                meta: {
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
                        },
                        email_capture_enforcement:
                            GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
                    },
                    language: SPANISH_LANGUAGE,
                },
            })

            const component = shallow(
                <GorgiasChatIntegrationPreferencesComponent
                    {...minProps}
                    integration={integration}
                />
            )

            expect(component.state()).toMatchSnapshot()
        })
    })

    describe('componentDidUpdate()', () => {
        it(
            'should initialize the state using the integration passed because the state was not initialized yet and ' +
                'the integration passed is not empty',
            () => {
                const integration: Map<any, any> = fromJS({
                    id: 1,
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    meta: {
                        preferences: {
                            auto_responder: {
                                enabled: true,
                                reply: CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
                            },
                            email_capture_enforcement:
                                GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
                        },
                        language: SPANISH_LANGUAGE,
                    },
                })

                const component = shallow(
                    <GorgiasChatIntegrationPreferencesComponent {...minProps} />
                )

                component.setProps({integration})

                expect(component.state()).toMatchSnapshot()
            }
        )

        it('should not initialize the state because it was already initialized', () => {
            const integration: Map<any, any> = fromJS({
                id: 1,
                type: GORGIAS_CHAT_INTEGRATION_TYPE,
                meta: {
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
                        },
                        email_capture_enforcement:
                            GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
                    },
                    language: SPANISH_LANGUAGE,
                },
            })

            const component = shallow(
                <GorgiasChatIntegrationPreferencesComponent {...minProps} />
            )

            component.setState({isInitialized: true})
            const prevState = component.state()

            component.setProps({integration})

            expect(component.state()).toEqual(prevState)
        })

        it('should not initialize the state because the passed integration is empty', () => {
            const component = shallow(
                <GorgiasChatIntegrationPreferencesComponent {...minProps} />
            )

            const prevState = component.state()

            component.setProps({integration: fromJS({})})

            expect(component.state()).toEqual(prevState)
        })
    })

    describe('_setEmailCaptureEnforcement()', () => {
        it('should set passed value in the state and set the preview to "email capture"', () => {
            const integration: Map<any, any> = fromJS({
                id: 1,
                type: GORGIAS_CHAT_INTEGRATION_TYPE,
                meta: {
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
                        },
                        email_capture_enforcement:
                            GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
                    },
                    language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                },
            })

            const component =
                shallow<GorgiasChatIntegrationPreferencesComponent>(
                    <GorgiasChatIntegrationPreferencesComponent
                        {...minProps}
                        integration={integration}
                    />
                )

            component.setState({preview: PREVIEW_AUTO_RESPONDER})

            const prevState = component.state()
            expect(prevState.emailCaptureEnforcement).toEqual(
                GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT
            )
            expect(prevState.preview).toEqual(PREVIEW_AUTO_RESPONDER)

            const expectedState = (fromJS(prevState) as Map<any, any>)
                .set(
                    'emailCaptureEnforcement',
                    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED
                )
                .set('preview', PREVIEW_EMAIL_CAPTURE)
                .toJS()

            component
                .instance()
                ._setEmailCaptureEnforcement(
                    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED
                )

            expect(component.state()).toEqual(expectedState)
        })
    })

    describe('_setAutoResponderEnabled()', () => {
        it(
            'should set passed value in the state and set the preview to "auto responder" because the auto responder' +
                'was enabled',
            () => {
                const autoResponderEnabled = false
                const integration: Map<any, any> = fromJS({
                    id: 1,
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    meta: {
                        preferences: {
                            auto_responder: {
                                enabled: autoResponderEnabled,
                                reply: CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
                            },
                            email_capture_enforcement:
                                GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
                        },
                        language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                    },
                })

                const component =
                    shallow<GorgiasChatIntegrationPreferencesComponent>(
                        <GorgiasChatIntegrationPreferencesComponent
                            updateOrCreateIntegration={jest.fn()}
                            integration={integration}
                        />
                    )

                const prevState = component.state()
                expect(prevState.autoResponderEnabled).toEqual(
                    autoResponderEnabled
                )
                expect(prevState.preview).toEqual(PREVIEW_EMAIL_CAPTURE)

                const expectedState = (fromJS(prevState) as Map<any, any>)
                    .set('autoResponderEnabled', !autoResponderEnabled)
                    .set('preview', PREVIEW_AUTO_RESPONDER)
                    .toJS()

                component
                    .instance()
                    ._setAutoResponderEnabled(!autoResponderEnabled)

                expect(component.state()).toEqual(expectedState)
            }
        )

        it(
            'should set passed value in the state and set the preview to "email capture" because the auto responder' +
                'was disabled',
            () => {
                const autoResponderEnabled = true
                const integration: Map<any, any> = fromJS({
                    id: 1,
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    meta: {
                        preferences: {
                            auto_responder: {
                                enabled: autoResponderEnabled,
                                reply: CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
                            },
                            email_capture_enforcement:
                                GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
                        },
                        language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                    },
                })

                const component =
                    shallow<GorgiasChatIntegrationPreferencesComponent>(
                        <GorgiasChatIntegrationPreferencesComponent
                            {...minProps}
                            integration={integration}
                        />
                    )

                component.setState({preview: PREVIEW_AUTO_RESPONDER})

                const prevState = component.state()
                expect(prevState.autoResponderEnabled).toEqual(
                    autoResponderEnabled
                )
                expect(prevState.preview).toEqual(PREVIEW_AUTO_RESPONDER)

                const expectedState = (fromJS(prevState) as Map<any, any>)
                    .set('autoResponderEnabled', !autoResponderEnabled)
                    .set('preview', PREVIEW_EMAIL_CAPTURE)
                    .toJS()

                component
                    .instance()
                    ._setAutoResponderEnabled(!autoResponderEnabled)

                expect(component.state()).toEqual(expectedState)
            }
        )
    })

    describe('_setAutoResponderReply()', () => {
        it('should set passed value in the state and set the preview to "auto responder"', () => {
            const integration: Map<any, any> = fromJS({
                id: 1,
                type: GORGIAS_CHAT_INTEGRATION_TYPE,
                meta: {
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
                        },
                        email_capture_enforcement:
                            GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
                    },
                    language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                },
            })

            const component =
                shallow<GorgiasChatIntegrationPreferencesComponent>(
                    <GorgiasChatIntegrationPreferencesComponent
                        {...minProps}
                        integration={integration}
                    />
                )

            const prevState = component.state()
            expect(prevState.autoResponderReply).toEqual(
                CHAT_AUTO_RESPONDER_REPLY_SHORTLY
            )
            expect(prevState.preview).toEqual(PREVIEW_EMAIL_CAPTURE)

            const expectedState = (fromJS(prevState) as Map<any, any>)
                .set('autoResponderReply', CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES)
                .set('preview', PREVIEW_AUTO_RESPONDER)
                .toJS()

            component
                .instance()
                ._setAutoResponderReply(CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES)

            expect(component.state()).toEqual(expectedState)
        })
    })

    describe('_setLiveChatAvailability()', () => {
        it('should set passed value in the state and set the preview to "live chat availability"', () => {
            const integration: Map<any, any> = fromJS({
                id: 1,
                type: GORGIAS_CHAT_INTEGRATION_TYPE,
                meta: {
                    preferences: {
                        live_chat_availability:
                            GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
                    },
                },
            })

            const component =
                shallow<GorgiasChatIntegrationPreferencesComponent>(
                    <GorgiasChatIntegrationPreferencesComponent
                        {...minProps}
                        integration={integration}
                    />
                )

            const prevState = component.state()
            expect(prevState.liveChatAvailability).toEqual(
                GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY
            )
            expect(prevState.preview).toEqual(PREVIEW_EMAIL_CAPTURE)

            const expectedState = (fromJS(prevState) as Map<any, any>)
                .set(
                    'liveChatAvailability',
                    GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS
                )
                .set('preview', PREVIEW_LIVE_CHAT_AVAILABILITY)
                .toJS()

            component
                .instance()
                ._setLiveChatAvailability(
                    GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS
                )

            expect(component.state()).toEqual(expectedState)
        })
    })

    describe('_setLinkedEmailIntegration()', () => {
        it('should update the linked email integration in the state.', () => {
            const component =
                shallow<GorgiasChatIntegrationPreferencesComponent>(
                    <GorgiasChatIntegrationPreferencesComponent {...minProps} />
                )

            expect(component.state()).toMatchSnapshot()
            component.instance()._setLinkedEmailIntegration(234)
            expect(component.state()).toMatchSnapshot()
        })
    })

    describe('_submitPreferences()', () => {
        it('should be called when the form is submitted', () => {
            ;[
                'email-prompt-help',
                'hide-outside-business-hours-help',
                'dynamic-wait-time-option',
            ].forEach((tooltipId) => {
                const mockedTooltip = document.createElement('div')
                mockedTooltip.setAttribute('id', tooltipId)
                document.body.appendChild(mockedTooltip)
            })

            const component = mount<GorgiasChatIntegrationPreferencesComponent>(
                <GorgiasChatIntegrationPreferencesComponent {...minProps} />
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

            const component =
                shallow<GorgiasChatIntegrationPreferencesComponent>(
                    <GorgiasChatIntegrationPreferencesComponent
                        {...minProps}
                        updateOrCreateIntegration={updateOrCreateIntegration}
                        integration={fromJS({
                            type: GORGIAS_CHAT_INTEGRATION_TYPE,
                            meta: {
                                language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                            },
                        })}
                    />
                )

            await component.instance()._submitPreferences({
                preventDefault: _noop,
            } as unknown as SyntheticEvent)

            expect(updateOrCreateIntegration).toMatchSnapshot()
        })

        it('should submit the form with loaded values', async () => {
            const updateOrCreateIntegration = jest.fn()

            const integration: Map<any, any> = fromJS({
                id: 1,
                type: GORGIAS_CHAT_INTEGRATION_TYPE,
                meta: {
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
                        },
                        email_capture_enforcement:
                            GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
                    },
                    language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                },
            })

            const component =
                shallow<GorgiasChatIntegrationPreferencesComponent>(
                    <GorgiasChatIntegrationPreferencesComponent
                        {...minProps}
                        updateOrCreateIntegration={updateOrCreateIntegration}
                        integration={integration}
                    />
                )

            const newAutoResponder = {
                enabled: false,
                reply: CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
            }

            component.setState({
                autoResponderEnabled: newAutoResponder.enabled,
                autoResponderReply: newAutoResponder.reply,
            })

            await component.instance()._submitPreferences({
                preventDefault: _noop,
            } as unknown as SyntheticEvent)

            expect(updateOrCreateIntegration).toMatchSnapshot()
        })
    })

    describe('render()', () => {
        it('should render the Chat preferences', () => {
            const component = shallow(
                <GorgiasChatIntegrationPreferencesComponent
                    {...minProps}
                    integration={fromJS({
                        id: 2,
                        type: GORGIAS_CHAT_INTEGRATION_TYPE,
                        meta: {
                            language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                        },
                        decoration: {
                            main_color: '#789c5d',
                            conversation_color: '#08d123',
                        },
                    })}
                />
            )
            expect(component).toMatchSnapshot()
        })

        it('should render buttons in loading state because preferences are being submitted', () => {
            const component = shallow(
                <GorgiasChatIntegrationPreferencesComponent
                    {...minProps}
                    integration={fromJS({
                        id: 2,
                        type: GORGIAS_CHAT_INTEGRATION_TYPE,
                        meta: {
                            language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                        },
                        decoration: {
                            main_color: '#789c5d',
                            conversation_color: '#08d123',
                        },
                    })}
                />
            )

            component.setState({isUpdating: true})

            expect(component).toMatchSnapshot()
        })
    })
})
