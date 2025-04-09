import { AiAgentOnboardingWizardStep } from 'models/aiAgent/types'

import {
    AiAgentChannel,
    CUSTOM_TONE_OF_VOICE_MAX_LENGTH,
    SIGNATURE_MAX_LENGTH,
    ToneOfVoice,
} from '../../constants'
import { FormValues, ValidFormValues, WizardFormValues } from '../../types'
import {
    getValidStoreConfigurationFormValues,
    StoreConfigurationValidationMessage,
} from '../store-configuration-validation.utils'

const VALID_FORM_VALUES: ValidFormValues = {
    chatChannelDeactivatedDatetime: undefined,
    emailChannelDeactivatedDatetime: undefined,
    trialModeActivatedDatetime: null,
    previewModeActivatedDatetime: null,
    previewModeValidUntilDatetime: null,
    ticketSampleRate: null,
    silentHandover: null,
    monitoredEmailIntegrations: [],
    tags: null,
    signature: 'Signature',
    toneOfVoice: null,
    customToneOfVoiceGuidance: null,
    helpCenterId: 1,
    monitoredChatIntegrations: [],
    wizard: undefined,
    customFieldIds: [],
}

const DEFAULT_OPTIONS = {
    isOnboardingWizardPage: false,
    isAiAgentChatEnabled: false,
    isMultiChannelEnabled: false,
}

const WIZARD_FORM_VALUES: WizardFormValues = {
    completedDatetime: null,
    stepName: null,
    enabledChannels: null,
    isAutoresponderTurnedOff: null,
    onCompletePathway: null,
}

const EMAIL_INTEGRATION = {
    email: 'test@mail.com',
    id: 1,
}

describe('store-configuration-validation', () => {
    describe('getValidStoreConfigurationFormValues', () => {
        it('should return store configuration from form values', () => {
            const result = getValidStoreConfigurationFormValues(
                VALID_FORM_VALUES,
                [],
                false,
                DEFAULT_OPTIONS,
            )

            expect(result).toEqual(VALID_FORM_VALUES)
        })

        it('should rerun default values when no email and chat integrations and both channels disabled', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                emailChannelDeactivatedDatetime: '2021-01-01T00:00:00',
                chatChannelDeactivatedDatetime: '2021-01-01T00:00:00',
                monitoredEmailIntegrations: [],
                monitoredChatIntegrations: [],
            }
            const expected: ValidFormValues = {
                ...formValues,
                signature: 'Signature',
                monitoredChatIntegrations: [],
                monitoredEmailIntegrations: [],
            }
            expect(
                getValidStoreConfigurationFormValues(
                    formValues,
                    [],
                    false,
                    DEFAULT_OPTIONS,
                ),
            ).toEqual(expected)
        })

        it('should return default values for signature and monitored integrations if wizard is not completed', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                wizard: {
                    ...WIZARD_FORM_VALUES,
                    completedDatetime: null,
                },
                signature: null,
                monitoredEmailIntegrations: null,
                monitoredChatIntegrations: null,
            }
            const expected: ValidFormValues = {
                ...formValues,
                signature: '',
                monitoredChatIntegrations: [],
                monitoredEmailIntegrations: [],
            }

            expect(
                getValidStoreConfigurationFormValues(
                    formValues,
                    [],
                    false,
                    DEFAULT_OPTIONS,
                ),
            ).toEqual(expected)
        })

        it('should throw an error if signature length is too big', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                signature: 'a'.repeat(SIGNATURE_MAX_LENGTH + 1),
                emailChannelDeactivatedDatetime: null,
            }
            expect(() =>
                getValidStoreConfigurationFormValues(
                    formValues,
                    [],
                    false,
                    DEFAULT_OPTIONS,
                ),
            ).toThrow(StoreConfigurationValidationMessage.SignatureLength)
        })

        it('should throw an error if signature is empty and wizard is not completed', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                signature: '',
                wizard: null,
                emailChannelDeactivatedDatetime: null,
            }
            expect(() =>
                getValidStoreConfigurationFormValues(
                    formValues,
                    [],
                    false,
                    DEFAULT_OPTIONS,
                ),
            ).toThrow(StoreConfigurationValidationMessage.SignatureEmpty)
        })

        it('should throw an error if signature empty and wizard completed', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                signature: '',
                wizard: {
                    ...WIZARD_FORM_VALUES,
                    completedDatetime: '2021-01-01T00:00:00',
                },
                emailChannelDeactivatedDatetime: null,
            }
            expect(() =>
                getValidStoreConfigurationFormValues(
                    formValues,
                    [],
                    false,
                    DEFAULT_OPTIONS,
                ),
            ).toThrow(StoreConfigurationValidationMessage.FieldsMissing)
        })

        it('should throw an error if tags have empty fields', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                tags: [{ name: '', description: '' }],
            }
            expect(() =>
                getValidStoreConfigurationFormValues(
                    formValues,
                    [],
                    false,
                    DEFAULT_OPTIONS,
                ),
            ).toThrow(StoreConfigurationValidationMessage.TagsEmpty)
        })

        it('should throw an error if tone of voice is selected and custom tone of voice is empty', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                toneOfVoice: ToneOfVoice.Custom,
                customToneOfVoiceGuidance: ' ',
            }
            expect(() =>
                getValidStoreConfigurationFormValues(
                    formValues,
                    [],
                    false,
                    DEFAULT_OPTIONS,
                ),
            ).toThrow(
                StoreConfigurationValidationMessage.CustomToneOfVoiceEmpty,
            )
        })

        it('should throw an error if tone of voice is selected and custom tone of voice is too long', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                toneOfVoice: ToneOfVoice.Custom,
                customToneOfVoiceGuidance: 'a'.repeat(
                    CUSTOM_TONE_OF_VOICE_MAX_LENGTH + 1,
                ),
            }
            expect(() =>
                getValidStoreConfigurationFormValues(
                    formValues,
                    [],
                    false,
                    DEFAULT_OPTIONS,
                ),
            ).toThrow(
                StoreConfigurationValidationMessage.CustomToneOfVoiceLength,
            )
        })

        it('should throw an error if no help center selected and public urls is empty when wizard finished and this is onboarding page', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                wizard: {
                    ...WIZARD_FORM_VALUES,
                    completedDatetime: '2021-01-01T00:00:00',
                },
                helpCenterId: null,
            }
            expect(() =>
                getValidStoreConfigurationFormValues(formValues, [], false, {
                    ...DEFAULT_OPTIONS,
                    isOnboardingWizardPage: true,
                }),
            ).toThrow(StoreConfigurationValidationMessage.HelpCenterError)
        })

        it('should throw an error if no help center selected and public urls is empty when wizard finished and this is not onboarding page', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                wizard: {
                    ...WIZARD_FORM_VALUES,
                    completedDatetime: '2021-01-01T00:00:00',
                },
                helpCenterId: null,
            }
            expect(() =>
                getValidStoreConfigurationFormValues(formValues, [], false, {
                    ...DEFAULT_OPTIONS,
                    isOnboardingWizardPage: false,
                }),
            ).toThrow(StoreConfigurationValidationMessage.HelpCenterEmpty)
        })

        it('should throw an error if monitored email integrations is empty and email ai agent is active', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                monitoredEmailIntegrations: [],
                emailChannelDeactivatedDatetime: null,
            }

            expect(() =>
                getValidStoreConfigurationFormValues(formValues, [], false, {
                    ...DEFAULT_OPTIONS,
                }),
            ).toThrow(StoreConfigurationValidationMessage.EmailIntegrationError)
        })

        describe('wizard page validation', () => {
            it('should throw an error if no monitoredChatIntegrations selected and chat channel selected', () => {
                const formValues: FormValues = {
                    ...VALID_FORM_VALUES,
                    monitoredChatIntegrations: [],
                    wizard: {
                        ...WIZARD_FORM_VALUES,
                        stepName: AiAgentOnboardingWizardStep.Knowledge,
                        enabledChannels: [AiAgentChannel.Chat],
                    },
                }

                expect(() =>
                    getValidStoreConfigurationFormValues(
                        formValues,
                        [],
                        false,
                        {
                            ...DEFAULT_OPTIONS,
                            isOnboardingWizardPage: true,
                        },
                    ),
                ).toThrow(StoreConfigurationValidationMessage.FieldsMissing)
            })

            it('should throw an error if no monitoredEmailIntegrations selected and email channel selected', () => {
                const formValues: FormValues = {
                    ...VALID_FORM_VALUES,
                    monitoredEmailIntegrations: [],
                    wizard: {
                        ...WIZARD_FORM_VALUES,
                        stepName: AiAgentOnboardingWizardStep.Knowledge,
                        enabledChannels: [AiAgentChannel.Email],
                    },
                }
                expect(() =>
                    getValidStoreConfigurationFormValues(
                        formValues,
                        [],
                        false,
                        {
                            ...DEFAULT_OPTIONS,
                            isOnboardingWizardPage: true,
                        },
                    ),
                ).toThrow(StoreConfigurationValidationMessage.FieldsMissing)
            })

            it('should throw an error if no channel is selected in the knowledge step', () => {
                const formValues: FormValues = {
                    ...VALID_FORM_VALUES,
                    wizard: {
                        ...WIZARD_FORM_VALUES,
                        stepName: AiAgentOnboardingWizardStep.Knowledge,
                        enabledChannels: [],
                    },
                }
                expect(() =>
                    getValidStoreConfigurationFormValues(
                        formValues,
                        [],
                        false,
                        {
                            ...DEFAULT_OPTIONS,
                            isOnboardingWizardPage: true,
                        },
                    ),
                ).toThrow(StoreConfigurationValidationMessage.NoChannelError)
            })
        })

        describe('multi-channel enabled', () => {
            it('should throw an error if signature empty and email channel is enabled', () => {
                const formValues: FormValues = {
                    ...VALID_FORM_VALUES,
                    signature: '',
                    emailChannelDeactivatedDatetime: null,
                }
                expect(() =>
                    getValidStoreConfigurationFormValues(
                        formValues,
                        [],
                        false,
                        {
                            ...DEFAULT_OPTIONS,
                        },
                    ),
                ).toThrow(StoreConfigurationValidationMessage.SignatureEmpty)
            })

            it('should throw an error if signature length is too big and email channel is enabled', () => {
                const formValues: FormValues = {
                    ...VALID_FORM_VALUES,
                    signature: 'a'.repeat(SIGNATURE_MAX_LENGTH + 1),
                    emailChannelDeactivatedDatetime: null,
                }
                expect(() =>
                    getValidStoreConfigurationFormValues(
                        formValues,
                        [],
                        false,
                        {
                            ...DEFAULT_OPTIONS,
                        },
                    ),
                ).toThrow(StoreConfigurationValidationMessage.SignatureLength)
            })

            it('should throw an error if no email integration is selected and email channel is enabled', () => {
                const formValues: FormValues = {
                    ...VALID_FORM_VALUES,
                    monitoredEmailIntegrations: [],
                    emailChannelDeactivatedDatetime: null,
                }
                expect(() =>
                    getValidStoreConfigurationFormValues(
                        formValues,
                        [],
                        false,
                        {
                            ...DEFAULT_OPTIONS,
                        },
                    ),
                ).toThrow(
                    StoreConfigurationValidationMessage.EmailIntegrationError,
                )
            })

            it('should throw an error if no chat integration is selected and chat channel is enabled', () => {
                const formValues: FormValues = {
                    ...VALID_FORM_VALUES,
                    monitoredEmailIntegrations: [EMAIL_INTEGRATION],
                    monitoredChatIntegrations: [],
                    chatChannelDeactivatedDatetime: null,
                }
                expect(() =>
                    getValidStoreConfigurationFormValues(
                        formValues,
                        [],
                        false,
                        {
                            ...DEFAULT_OPTIONS,
                            isAiAgentChatEnabled: true,
                        },
                    ),
                ).toThrow(
                    StoreConfigurationValidationMessage.ChatIntegrationError,
                )
            })
        })
    })
})
