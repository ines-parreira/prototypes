import React from 'react'
import {mount, shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {
    CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
    CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
} from '../../../../../../../config/integrations/index.ts'

import {
    SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_DEFAULT,
    SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
    SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
} from '../../../../../../../config/integrations/smooch_inside.ts'

import {SMOOCH_INSIDE_INTEGRATION_TYPE} from '../../../../../../../constants/integration.ts'
import {SPANISH_LANGUAGE} from '../../../../../../../constants/languages.ts'
import {
    ChatIntegrationPreferences,
    PREVIEW_AUTO_RESPONDER,
    PREVIEW_EMAIL_CAPTURE,
} from '../ChatIntegrationPreferences.tsx'

describe('<ChatIntegrationPreferences/>', () => {
    describe('componentDidMount()', () => {
        it('should not initialize the state because the passed integration is empty', () => {
            const component = shallow(
                <ChatIntegrationPreferences
                    updateOrCreateIntegration={jest.fn()}
                    integration={fromJS({})}
                />,
                {disableLifecycleMethods: true}
            )

            const prevState = component.state()
            component.instance().componentDidMount()
            expect(component.state()).toEqual(prevState)
        })

        it('should initialize the state using the integration passed', () => {
            const integration = fromJS({
                id: 1,
                type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                meta: {
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
                        },
                        email_capture_enforcement:
                            SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
                    },
                    language: SPANISH_LANGUAGE,
                },
            })

            const component = shallow(
                <ChatIntegrationPreferences
                    updateOrCreateIntegration={jest.fn()}
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
                const integration = fromJS({
                    id: 1,
                    type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                    meta: {
                        preferences: {
                            auto_responder: {
                                enabled: true,
                                reply: CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
                            },
                            email_capture_enforcement:
                                SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
                        },
                        language: SPANISH_LANGUAGE,
                    },
                })

                const component = shallow(
                    <ChatIntegrationPreferences
                        updateOrCreateIntegration={jest.fn()}
                        integration={fromJS({})}
                    />
                )

                component.setProps({integration})

                expect(component.state()).toMatchSnapshot()
            }
        )

        it('should not initialize the state because it was already initialized', () => {
            const integration = fromJS({
                id: 1,
                type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                meta: {
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
                        },
                        email_capture_enforcement:
                            SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
                    },
                    language: SPANISH_LANGUAGE,
                },
            })

            const component = shallow(
                <ChatIntegrationPreferences
                    updateOrCreateIntegration={jest.fn()}
                    integration={fromJS({})}
                />
            )

            component.setState({isInitialized: true})
            const prevState = component.state()

            component.setProps({integration})

            expect(component.state()).toEqual(prevState)
        })

        it('should not initialize the state because the passed integration is empty', () => {
            const component = shallow(
                <ChatIntegrationPreferences
                    updateOrCreateIntegration={jest.fn()}
                    integration={fromJS({})}
                />
            )

            const prevState = component.state()

            component.setProps({integration: fromJS({})})

            expect(component.state()).toEqual(prevState)
        })
    })

    describe('_setEmailCaptureEnforcement()', () => {
        it('should set passed value in the state and set the preview to "email capture"', () => {
            const integration = fromJS({
                id: 1,
                type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                meta: {
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
                        },
                        email_capture_enforcement:
                            SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_DEFAULT,
                    },
                    language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
                },
            })

            const component = shallow(
                <ChatIntegrationPreferences
                    updateOrCreateIntegration={jest.fn()}
                    integration={integration}
                />
            )

            component.setState({preview: PREVIEW_AUTO_RESPONDER})

            const prevState = component.state()
            expect(prevState.emailCaptureEnforcement).toEqual(
                SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_DEFAULT
            )
            expect(prevState.preview).toEqual(PREVIEW_AUTO_RESPONDER)

            const expectedState = fromJS(prevState)
                .set(
                    'emailCaptureEnforcement',
                    SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED
                )
                .set('preview', PREVIEW_EMAIL_CAPTURE)
                .toJS()

            component
                .instance()
                ._setEmailCaptureEnforcement(
                    SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED
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
                const integration = fromJS({
                    id: 1,
                    type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                    meta: {
                        preferences: {
                            auto_responder: {
                                enabled: autoResponderEnabled,
                                reply: CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
                            },
                            email_capture_enforcement:
                                SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_DEFAULT,
                        },
                        language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
                    },
                })

                const component = shallow(
                    <ChatIntegrationPreferences
                        updateOrCreateIntegration={jest.fn()}
                        integration={integration}
                    />
                )

                const prevState = component.state()
                expect(prevState.autoResponderEnabled).toEqual(
                    autoResponderEnabled
                )
                expect(prevState.preview).toEqual(PREVIEW_EMAIL_CAPTURE)

                const expectedState = fromJS(prevState)
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
                const integration = fromJS({
                    id: 1,
                    type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                    meta: {
                        preferences: {
                            auto_responder: {
                                enabled: autoResponderEnabled,
                                reply: CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
                            },
                            email_capture_enforcement:
                                SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_DEFAULT,
                        },
                        language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
                    },
                })

                const component = shallow(
                    <ChatIntegrationPreferences
                        updateOrCreateIntegration={jest.fn()}
                        integration={integration}
                    />
                )

                component.setState({preview: PREVIEW_AUTO_RESPONDER})

                const prevState = component.state()
                expect(prevState.autoResponderEnabled).toEqual(
                    autoResponderEnabled
                )
                expect(prevState.preview).toEqual(PREVIEW_AUTO_RESPONDER)

                const expectedState = fromJS(prevState)
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
            const integration = fromJS({
                id: 1,
                type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                meta: {
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
                        },
                        email_capture_enforcement:
                            SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_DEFAULT,
                    },
                    language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
                },
            })

            const component = shallow(
                <ChatIntegrationPreferences
                    updateOrCreateIntegration={jest.fn()}
                    integration={integration}
                />
            )

            const prevState = component.state()
            expect(prevState.autoResponderReply).toEqual(
                CHAT_AUTO_RESPONDER_REPLY_SHORTLY
            )
            expect(prevState.preview).toEqual(PREVIEW_EMAIL_CAPTURE)

            const expectedState = fromJS(prevState)
                .set('autoResponderReply', CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES)
                .set('preview', PREVIEW_AUTO_RESPONDER)
                .toJS()

            component
                .instance()
                ._setAutoResponderReply(CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES)

            expect(component.state()).toEqual(expectedState)
        })
    })

    describe('_setLinkedEmailIntegration()', () => {
        it('should update the linked email integration in the state.', () => {
            const component = shallow(
                <ChatIntegrationPreferences
                    updateOrCreateIntegration={() => {}}
                    integration={fromJS({})}
                />
            )

            expect(component.state()).toMatchSnapshot()
            component.instance()._setLinkedEmailIntegration(234)
            expect(component.state()).toMatchSnapshot()
        })
    })

    describe('_submitPreferences()', () => {
        it('should be called when the form is submitted', () => {
            const mockedTooltip = document.createElement('div')
            mockedTooltip.setAttribute('id', 'email-capture-help')
            document.body.appendChild(mockedTooltip)
            const component = mount(
                <ChatIntegrationPreferences
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
                <ChatIntegrationPreferences
                    updateOrCreateIntegration={updateOrCreateIntegration}
                    integration={fromJS({
                        type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                        meta: {
                            language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
                        },
                    })}
                />
            )

            await component
                .instance()
                ._submitPreferences({preventDefault: jest.fn()})

            expect(updateOrCreateIntegration).toMatchSnapshot()
        })

        it('should submit the form with loaded values', async () => {
            const updateOrCreateIntegration = jest.fn()

            const integration = fromJS({
                id: 1,
                type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                meta: {
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
                        },
                        email_capture_enforcement:
                            SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_DEFAULT,
                    },
                    language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
                },
            })

            const component = shallow(
                <ChatIntegrationPreferences
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

            await component
                .instance()
                ._submitPreferences({preventDefault: jest.fn()})

            expect(updateOrCreateIntegration).toMatchSnapshot()
        })
    })

    describe('render()', () => {
        it('should render the Chat preferences', () => {
            const component = shallow(
                <ChatIntegrationPreferences
                    updateOrCreateIntegration={jest.fn()}
                    integration={fromJS({
                        id: 2,
                        type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                        meta: {
                            language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
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
                <ChatIntegrationPreferences
                    updateOrCreateIntegration={jest.fn()}
                    integration={fromJS({
                        id: 2,
                        type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                        meta: {
                            language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
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
