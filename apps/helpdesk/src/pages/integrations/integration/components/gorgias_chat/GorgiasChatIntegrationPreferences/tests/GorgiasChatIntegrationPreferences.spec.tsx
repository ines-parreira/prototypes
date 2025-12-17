import type { ComponentProps } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { fireEvent, render } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import {
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
} from 'config/integrations/gorgias_chat'
import {
    CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
    CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
} from 'config/integrations/index'
import { GORGIAS_CHAT_INTEGRATION_TYPE } from 'constants/integration'
import { Language } from 'constants/languages'
import { user } from 'fixtures/users'
import type { IntegrationFromType } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import type { SelfServiceConfiguration } from 'models/selfServiceConfiguration/types'
import { ReturnActionType } from 'models/selfServiceConfiguration/types'
import * as IntegrationsActions from 'state/integrations/actions'
import type { RootState, StoreDispatch } from 'state/types'

import { GorgiasChatIntegrationPreferencesComponent } from '../GorgiasChatIntegrationPreferences'

const mockStore = configureMockStore<RootState, StoreDispatch>()

const defaultState = {
    agents: fromJS({
        all: [user],
    }),
    entities: {
        chatInstallationStatus: { installed: true },
    },
} as unknown as RootState

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn((flag, defaultValue) => defaultValue),
}))
jest.mock('models/selfServiceConfiguration/resources')

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationHeader',
    () => () => {
        return <div data-testid="GorgiasChatIntegrationHeader" />
    },
)

jest.mock('../../GorgiasChatIntegrationConnectedChannel', () => () => {
    return <div data-testid="GorgiasChatIntegrationConnectedChannel" />
})

const mockGetTranslations = IntegrationsActions.getTranslations as jest.Mock

jest.mock('state/integrations/actions', () => {
    return {
        getTranslations: jest.fn().mockResolvedValue({}),
        getApplicationTexts: jest.fn().mockResolvedValue({}),
        updateApplicationTexts: jest.fn().mockResolvedValue({}),
    }
})

describe('<GorgiasChatIntegrationPreferences/>', () => {
    const minProps: ComponentProps<
        typeof GorgiasChatIntegrationPreferencesComponent
    > = {
        currentUser: fromJS({
            name: 'John Doe',
        }),
        integration: fromJS({}),
        emailIntegrations: [],
        updateOrCreateIntegration: jest.fn(),
        articleRecommendationEnabled: true,
        convertProduct: undefined,
        actions: {
            getTranslations: jest.fn(),
            getApplicationTexts: jest.fn(),
            updateApplicationTexts: jest.fn(),
        } as unknown as typeof IntegrationsActions,
        selfServiceConfiguration: null,
        selfServiceConfigurationEnabled: false,
    }

    describe('componentDidMount()', () => {
        it('should not initialize the state because the passed integration is empty', () => {
            const { getAllByRole } = render(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationPreferencesComponent
                            {...minProps}
                        />
                    </Provider>
                </MemoryRouter>,
            )

            // chat title should be empty
            expect(getAllByRole('listitem')[1]).toBeEmpty()
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
                        display_campaigns_hidden_chat: false,
                    },
                    shop_integration_id: 1,
                    language: Language.Spanish,
                },
                name: 'Foo Chat',
            })

            const { getAllByText } = render(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationPreferencesComponent
                            {...minProps}
                            integration={integration}
                        />
                    </Provider>
                </MemoryRouter>,
            )

            expect(getAllByText('Foo Chat')).toHaveLength(2)
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
                        shop_integration_id: 1,
                        language: Language.Spanish,
                    },
                    name: 'Foo Chat',
                })

                const { rerender, queryByText, getAllByText } = render(
                    <MemoryRouter>
                        <Provider store={mockStore(defaultState)}>
                            {' '}
                            <GorgiasChatIntegrationPreferencesComponent
                                {...minProps}
                            />
                        </Provider>
                    </MemoryRouter>,
                )

                expect(queryByText('Foo Chat')).toBeNull()

                rerender(
                    <MemoryRouter>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationPreferencesComponent
                                {...minProps}
                                integration={integration}
                            />
                        </Provider>
                    </MemoryRouter>,
                )

                expect(getAllByText('Foo Chat')).toHaveLength(2)
                expect(mockGetTranslations).toHaveBeenCalledTimes(1)
            },
        )

        it('should not reinitialize the state because it was already initialized', () => {
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
                    shop_integration_id: 1,
                    language: Language.Spanish,
                },
            })

            const { rerender } = render(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationPreferencesComponent
                            {...minProps}
                            integration={integration}
                        />
                    </Provider>
                </MemoryRouter>,
            )

            rerender(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationPreferencesComponent
                            {...minProps}
                            integration={integration}
                        />
                    </Provider>
                </MemoryRouter>,
            )

            expect(mockGetTranslations).toHaveBeenCalledTimes(1)
        })

        it('should not initialize the state because the passed integration is empty', () => {
            const { rerender } = render(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationPreferencesComponent
                            {...minProps}
                        />
                    </Provider>
                </MemoryRouter>,
            )

            rerender(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationPreferencesComponent
                            {...minProps}
                        />
                    </Provider>
                </MemoryRouter>,
            )

            expect(mockGetTranslations).not.toHaveBeenCalled()
        })
    })

    describe('_setEmailCaptureEnabled()', () => {
        it(
            'should set passed value in the state and set the preview to "email capture" because the email capture' +
                ' was enabled',
            () => {
                const emailCaptureEnabled = false
                const integration: Map<any, any> = fromJS({
                    id: 1,
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    meta: {
                        preferences: {
                            auto_responder: {
                                enabled: true,
                                reply: CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
                            },
                            email_capture_enabled: emailCaptureEnabled,
                            email_capture_enforcement:
                                GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
                        },
                        shop_integration_id: 1,
                        language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                    },
                })

                const { getByRole } = render(
                    <MemoryRouter>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationPreferencesComponent
                                currentUser={minProps.currentUser}
                                updateOrCreateIntegration={jest.fn()}
                                integration={integration}
                                articleRecommendationEnabled={true}
                                actions={minProps.actions}
                                selfServiceConfiguration={null}
                                selfServiceConfigurationEnabled={false}
                            />
                        </Provider>
                    </MemoryRouter>,
                )

                const emailCaptureToggle = getByRole('checkbox', {
                    name: /Enable email capture/,
                })

                expect(emailCaptureToggle).not.toBeChecked()

                fireEvent.click(emailCaptureToggle)

                expect(emailCaptureToggle).toBeChecked()
            },
        )
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
                    shop_integration_id: 1,
                    language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                },
            })

            const { getByRole } = render(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationPreferencesComponent
                            {...minProps}
                            integration={integration}
                        />
                    </Provider>
                </MemoryRouter>,
            )

            const alwaysRequiredRadio = getByRole('radio', { name: 'Required' })

            fireEvent.click(alwaysRequiredRadio)

            expect(alwaysRequiredRadio).toBeChecked()
        })
    })

    describe('_setAutoResponderEnabled()', () => {
        it(
            'should set passed value in the state and set the preview to "auto responder" because the auto responder' +
                ' was enabled',
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
                        shop_integration_id: 1,
                        language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                    },
                })

                const { getByText, queryByText, getByRole } = render(
                    <MemoryRouter>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationPreferencesComponent
                                currentUser={minProps.currentUser}
                                updateOrCreateIntegration={jest.fn()}
                                integration={integration}
                                articleRecommendationEnabled={true}
                                actions={minProps.actions}
                                selfServiceConfiguration={null}
                                selfServiceConfigurationEnabled={false}
                            />
                        </Provider>
                    </MemoryRouter>,
                )

                const autoResponderCheckbox = getByRole('switch', {
                    name: 'auto-responder-toggle',
                })

                expect(
                    getByText(
                        /let customers know how fast they can expect a response/,
                    ),
                ).toHaveClass('text-faded')

                fireEvent.click(autoResponderCheckbox)

                expect(autoResponderCheckbox).toBeChecked()
                expect(
                    getByText(
                        /let customers know how fast they can expect a response/,
                    ),
                ).not.toHaveClass('text-faded')
                expect(getByText('schedule')).toBeInTheDocument()

                fireEvent.click(autoResponderCheckbox)

                expect(
                    getByText(
                        /let customers know how fast they can expect a response/,
                    ),
                ).toHaveClass('text-faded')
                expect(autoResponderCheckbox).not.toBeChecked()
                expect(queryByText('schedule')).toBeNull()
            },
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
                            reply: GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
                        },
                        email_capture_enforcement:
                            GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
                    },
                    shop_integration_id: 1,
                    language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                },
            })

            const { getByRole } = render(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationPreferencesComponent
                            {...minProps}
                            integration={integration}
                        />
                    </Provider>
                </MemoryRouter>,
            )

            expect(
                getByRole('radio', { name: /Dynamic wait time/ }),
            ).toBeChecked()

            const inMinutesRadio = getByRole('radio', {
                name: 'In a few minutes',
            })
            fireEvent.click(inMinutesRadio)
            expect(inMinutesRadio).toBeChecked()
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
                    shop_integration_id: 1,
                },
            })

            const { getByRole } = render(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationPreferencesComponent
                            {...minProps}
                            integration={integration}
                        />
                    </Provider>
                </MemoryRouter>,
            )

            expect(
                getByRole('radio', { name: 'Live when agents are available' }),
            ).toBeChecked()

            const liveDuringBusinessHoursRadio = getByRole('radio', {
                name: 'Always live during business hours',
            })

            fireEvent.click(liveDuringBusinessHoursRadio)

            expect(liveDuringBusinessHoursRadio).toBeChecked()
        })
    })

    describe('_setDisplayCampaignsChatHidden()', () => {
        it('should update the display campaigns with hidden chat in the state.', () => {
            const { getByRole } = render(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationPreferencesComponent
                            {...minProps}
                            flags={{
                                [FeatureFlagKey.RevenueBetaTesters]: true,
                            }}
                        />
                    </Provider>
                </MemoryRouter>,
            )

            const displayCampaignsChatHiddenToggle = getByRole('switch', {
                name: /Hide chat/i,
            })

            expect(displayCampaignsChatHiddenToggle).not.toBeChecked()

            fireEvent.click(displayCampaignsChatHiddenToggle)

            expect(displayCampaignsChatHiddenToggle).toBeChecked()
        })
    })

    describe('_setLinkedEmailIntegration()', () => {
        it('should update the linked email integration in the state.', () => {
            const { getByText } = render(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationPreferencesComponent
                            {...minProps}
                            emailIntegrations={[
                                {
                                    id: 1,
                                    name: 'Foo Email Integration',
                                    meta: {
                                        address: 'foo@bar.baz',
                                    },
                                    type: IntegrationType.Email,
                                } as IntegrationFromType<IntegrationType.Email>,
                                {
                                    id: 2,
                                    name: 'Bar Email Integration',
                                    meta: {
                                        address: 'bar@bar.baz',
                                    },
                                    type: IntegrationType.Email,
                                } as IntegrationFromType<IntegrationType.Email>,
                            ]}
                        />
                    </Provider>
                </MemoryRouter>,
            )

            fireEvent.click(getByText('Select an email integration'))
            const emailIntegrationOption = getByText(/Bar Email Integration/)
            fireEvent.click(emailIntegrationOption)

            // dropdown closes and selected value is displayed
            expect(getByText(/Bar Email Integration/)).toBeInTheDocument()
        })
    })

    describe('_setControlTicketVolume()', () => {
        it('should update the control ticket volume in the state.', () => {
            const component = render(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationPreferencesComponent
                            {...minProps}
                        />
                    </Provider>
                </MemoryRouter>,
            )

            const controlTicketVolumeToggle = component.getByRole('checkbox', {
                name: /Remove “Send us a message” button/,
            })

            expect(controlTicketVolumeToggle).not.toBeChecked()

            fireEvent.click(controlTicketVolumeToggle)

            expect(controlTicketVolumeToggle).toBeChecked()
        })
    })

    describe('_submitPreferences()', () => {
        it('should be called when the form is submitted', () => {
            ;[
                'hide-chat-help',
                'hide-outside-business-hours-help',
                'dynamic-wait-time-option',
            ].forEach((tooltipId) => {
                const mockedTooltip = document.createElement('div')
                mockedTooltip.setAttribute('id', tooltipId)
                document.body.appendChild(mockedTooltip)
            })

            const { getByText } = render(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationPreferencesComponent
                            {...minProps}
                        />
                    </Provider>
                </MemoryRouter>,
            )

            fireEvent.click(getByText('Save Changes'))

            expect(minProps.updateOrCreateIntegration).toHaveBeenCalledTimes(1)
        })

        it('should submit the form with defaults', () => {
            const { getByText } = render(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationPreferencesComponent
                            {...minProps}
                            integration={fromJS({
                                type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                meta: {
                                    language:
                                        GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                                    shop_integration_id: 1,
                                },
                            })}
                        />
                    </Provider>
                </MemoryRouter>,
            )

            fireEvent.click(getByText('Save Changes'))

            expect(minProps.updateOrCreateIntegration).toMatchSnapshot()
        })

        it('should submit the form with loaded values', () => {
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
                    shop_integration_id: 1,
                    language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                },
            })

            const { getByRole, getByText } = render(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationPreferencesComponent
                            {...minProps}
                            integration={integration}
                        />
                    </Provider>
                </MemoryRouter>,
            )

            const autoResponderCheckbox = getByText(
                /Send auto-reply with wait time/i,
            )

            fireEvent.click(autoResponderCheckbox)
            fireEvent.click(
                getByRole('radio', {
                    name: 'In a few minutes',
                }),
            )

            fireEvent.click(getByText('Save Changes'))

            expect(minProps.updateOrCreateIntegration).toMatchSnapshot()
        })
    })

    describe('render()', () => {
        it('should render the Chat preferences', () => {
            const { container } = render(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationPreferencesComponent
                            {...minProps}
                            integration={fromJS({
                                id: 2,
                                type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                meta: {
                                    language:
                                        GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                                    shop_integration_id: 1,
                                },
                                decoration: {
                                    main_color: '#789c5d',
                                    conversation_color: '#08d123',
                                },
                            })}
                        />
                    </Provider>
                </MemoryRouter>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render buttons in loading state because preferences are being submitted', () => {
            const selfServiceConfiguration: SelfServiceConfiguration = {
                id: 1,
                type: IntegrationType.Shopify,
                shopName: 'my-shop',
                createdDatetime: '2024-01-01T00:00:00Z',
                updatedDatetime: '2024-01-02T00:00:00Z',
                deletedDatetime: null,
                articleRecommendationHelpCenterId: 123,
                reportIssuePolicy: {
                    enabled: true,
                    cases: [],
                },
                trackOrderPolicy: {
                    enabled: true,
                    unfulfilledMessage: {
                        html: '<p>Your order is on the way!</p>',
                        text: 'Your order is on the way!',
                    },
                },
                cancelOrderPolicy: {
                    enabled: true,
                    eligibilities: [],
                    exceptions: [],
                    action: {
                        type: 'automated_response',
                        responseMessageContent: {
                            html: '<p>Cancellation request received.</p>',
                            text: 'Cancellation request received.',
                        },
                    },
                },
                returnOrderPolicy: {
                    enabled: true,
                    eligibilities: [],
                    exceptions: [],
                    action: {
                        type: ReturnActionType.AutomatedResponse,
                        responseMessageContent: {
                            html: '<p>Return instructions sent.</p>',
                            text: 'Return instructions sent.',
                        },
                    },
                },
                workflowsEntrypoints: [],
            }

            const { getByText } = render(
                <MemoryRouter>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationPreferencesComponent
                            {...minProps}
                            integration={fromJS({
                                id: 2,
                                type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                meta: {
                                    language:
                                        GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                                    shop_integration_id: 1,
                                },
                                decoration: {
                                    main_color: '#789c5d',
                                    conversation_color: '#08d123',
                                },
                            })}
                            selfServiceConfiguration={selfServiceConfiguration}
                        />
                    </Provider>
                </MemoryRouter>,
            )
            const saveButton = getByText('Save Changes').parentElement!

            fireEvent.click(saveButton)

            expect(saveButton).toBeAriaDisabled()
        })
    })
})
