import {AiAgentOnboardingWizardStep} from 'models/aiAgent/types'

import {
    AiAgentChannel,
    CUSTOM_TONE_OF_VOICE_MAX_LENGTH,
    EXCLUDED_TOPIC_MAX_LENGTH,
    MAX_EXCLUDED_TOPICS,
    SIGNATURE_MAX_LENGTH,
    ToneOfVoice,
} from '../../constants'
import {FormValues, ValidFormValues, WizardFormValues} from '../../types'
import {
    StoreConfigurationValidationMessage,
    getValidStoreConfigurationFormValues,
} from '../store-configuration-validation.utils'

const VALID_FORM_VALUES: ValidFormValues = {
    deactivatedDatetime: undefined,
    chatChannelDeactivatedDatetime: undefined,
    emailChannelDeactivatedDatetime: undefined,
    trialModeActivatedDatetime: null,
    ticketSampleRate: null,
    silentHandover: null,
    monitoredEmailIntegrations: [],
    tags: null,
    excludedTopics: null,
    signature: 'Signature',
    toneOfVoice: null,
    customToneOfVoiceGuidance: null,
    helpCenterId: 1,
    monitoredChatIntegrations: [],
    wizard: undefined,
}

const DEFAULT_OPTIONS = {
    isOnboardingWizardPage: false,
    isAiAgentChatEnabled: false,
    isMultiChannelEnabled: false,
}

const WIZARD_FORM_VALUES: WizardFormValues = {
    completedDatetime: null,
    stepName: null,
    hasEducationStepEnabled: null,
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
                DEFAULT_OPTIONS
            )

            expect(result).toEqual(VALID_FORM_VALUES)
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
                    DEFAULT_OPTIONS
                )
            ).toEqual(expected)
        })

        it('should throw an error if signature length is too big', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                signature: 'a'.repeat(SIGNATURE_MAX_LENGTH + 1),
            }
            expect(() =>
                getValidStoreConfigurationFormValues(
                    formValues,
                    [],
                    DEFAULT_OPTIONS
                )
            ).toThrowError(StoreConfigurationValidationMessage.SignatureLength)
        })

        it('should throw an error if signature is empty and wizard is not completed', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                signature: '',
                wizard: null,
            }
            expect(() =>
                getValidStoreConfigurationFormValues(
                    formValues,
                    [],
                    DEFAULT_OPTIONS
                )
            ).toThrowError(StoreConfigurationValidationMessage.SignatureEmpty)
        })

        it('should throw an error if signature empty and wizard completed', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                signature: '',
                wizard: {
                    ...WIZARD_FORM_VALUES,
                    completedDatetime: '2021-01-01T00:00:00',
                },
            }
            expect(() =>
                getValidStoreConfigurationFormValues(
                    formValues,
                    [],
                    DEFAULT_OPTIONS
                )
            ).toThrowError(StoreConfigurationValidationMessage.FieldsMissing)
        })

        it('should throw an error if excluded topics have empty fields', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                excludedTopics: [''],
            }
            expect(() =>
                getValidStoreConfigurationFormValues(
                    formValues,
                    [],
                    DEFAULT_OPTIONS
                )
            ).toThrowError(
                StoreConfigurationValidationMessage.ExcludedTopicEmpty
            )
        })

        it('should throw an error if excluded topics are too big', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                excludedTopics: Array<string>(MAX_EXCLUDED_TOPICS + 1).fill(
                    'a'
                ),
            }
            expect(() =>
                getValidStoreConfigurationFormValues(
                    formValues,
                    [],
                    DEFAULT_OPTIONS
                )
            ).toThrowError(
                StoreConfigurationValidationMessage.ExcludedTopicsLength
            )
        })

        it('should throw an error if excluded topic is too big', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                excludedTopics: ['a'.repeat(EXCLUDED_TOPIC_MAX_LENGTH + 1)],
            }
            expect(() =>
                getValidStoreConfigurationFormValues(
                    formValues,
                    [],
                    DEFAULT_OPTIONS
                )
            ).toThrowError(
                StoreConfigurationValidationMessage.ExcludedTopicLength
            )
        })

        it('should throw an error if tags have empty fields', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                tags: [{name: '', description: ''}],
            }
            expect(() =>
                getValidStoreConfigurationFormValues(
                    formValues,
                    [],
                    DEFAULT_OPTIONS
                )
            ).toThrowError(StoreConfigurationValidationMessage.TagsEmpty)
        })

        it('should throw an error if tone of voice is selected and custome tone of voice is empty', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                toneOfVoice: ToneOfVoice.Custom,
                customToneOfVoiceGuidance: ' ',
            }
            expect(() =>
                getValidStoreConfigurationFormValues(
                    formValues,
                    [],
                    DEFAULT_OPTIONS
                )
            ).toThrowError(
                StoreConfigurationValidationMessage.CustomToneOfVoiceEmpty
            )
        })

        it('should throw an error if tone of voice is selected and custome tone of voice is too long', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                toneOfVoice: ToneOfVoice.Custom,
                customToneOfVoiceGuidance: 'a'.repeat(
                    CUSTOM_TONE_OF_VOICE_MAX_LENGTH + 1
                ),
            }
            expect(() =>
                getValidStoreConfigurationFormValues(
                    formValues,
                    [],
                    DEFAULT_OPTIONS
                )
            ).toThrowError(
                StoreConfigurationValidationMessage.CustomToneOfVoiceLength
            )
        })

        it('should throw an error if no channel is selected in the completed wizard', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                wizard: {
                    ...WIZARD_FORM_VALUES,
                    completedDatetime: '2021-01-01T00:00:00',
                    enabledChannels: [],
                },
            }
            expect(() =>
                getValidStoreConfigurationFormValues(
                    formValues,
                    [],
                    DEFAULT_OPTIONS
                )
            ).toThrowError(StoreConfigurationValidationMessage.NoChannelError)
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
                    DEFAULT_OPTIONS
                )
            ).toThrowError(StoreConfigurationValidationMessage.NoChannelError)
        })

        it('should throw an error if no email integration is selected in the completed wizard', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                monitoredEmailIntegrations: [],
                wizard: {
                    ...WIZARD_FORM_VALUES,
                    completedDatetime: '2021-01-01T00:00:00',
                    enabledChannels: [AiAgentChannel.Email],
                },
            }
            expect(() =>
                getValidStoreConfigurationFormValues(
                    formValues,
                    [],
                    DEFAULT_OPTIONS
                )
            ).toThrowError(StoreConfigurationValidationMessage.FieldsMissing)
        })

        it('should throw an error if no email integration is selected in the knowledge step', () => {
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
                    DEFAULT_OPTIONS
                )
            ).toThrowError(StoreConfigurationValidationMessage.FieldsMissing)
        })

        it('should throw an error if email integration is selected and no email channel is selected', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                monitoredEmailIntegrations: [EMAIL_INTEGRATION],
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
                    DEFAULT_OPTIONS
                )
            ).toThrowError(StoreConfigurationValidationMessage.FieldsMissing)
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
                getValidStoreConfigurationFormValues(formValues, [], {
                    ...DEFAULT_OPTIONS,
                    isOnboardingWizardPage: true,
                })
            ).toThrowError(StoreConfigurationValidationMessage.HelpCenterError)
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
                getValidStoreConfigurationFormValues(formValues, [], {
                    ...DEFAULT_OPTIONS,
                    isOnboardingWizardPage: false,
                })
            ).toThrowError(StoreConfigurationValidationMessage.HelpCenterEmpty)
        })

        it('should throw an error if monitored email integrations is empty and email ai agent is active', () => {
            const formValues: FormValues = {
                ...VALID_FORM_VALUES,
                monitoredEmailIntegrations: [],
                deactivatedDatetime: null,
            }

            expect(() =>
                getValidStoreConfigurationFormValues(formValues, [], {
                    ...DEFAULT_OPTIONS,
                    isMultiChannelEnabled: false,
                })
            ).toThrowError(
                StoreConfigurationValidationMessage.EmailIntegrationError
            )
        })

        describe('multi-channel enabled', () => {
            it('should throw an error if no email integration is selected and email channel is enabled', () => {
                const formValues: FormValues = {
                    ...VALID_FORM_VALUES,
                    monitoredEmailIntegrations: [],
                    emailChannelDeactivatedDatetime: null,
                }
                expect(() =>
                    getValidStoreConfigurationFormValues(formValues, [], {
                        ...DEFAULT_OPTIONS,
                        isMultiChannelEnabled: true,
                    })
                ).toThrowError(
                    StoreConfigurationValidationMessage.EmailIntegrationError
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
                    getValidStoreConfigurationFormValues(formValues, [], {
                        ...DEFAULT_OPTIONS,
                        isMultiChannelEnabled: true,
                        isAiAgentChatEnabled: true,
                    })
                ).toThrowError(
                    StoreConfigurationValidationMessage.ChatIntegrationError
                )
            })
        })
    })
})
