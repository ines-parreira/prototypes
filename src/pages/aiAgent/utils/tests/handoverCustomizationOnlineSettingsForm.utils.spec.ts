import { HandoverConfigurationData } from 'models/aiAgent/types'
import {
    GorgiasChatAutoResponderReply,
    GorgiasChatEmailCaptureType,
    GorgiasChatIntegration,
} from 'models/integration/types'

import {
    formFieldsConfiguration,
    getHandoverConfigurationFormDataFragment,
    getIntegrationPreferencesFormDataFragment,
    hasAnyChangeInFormValues,
    initialFormFieldValues,
    mapFromFormValuesToIntegrationPreferences,
} from '../handoverCustomizationOnlineSettingsForm.utils'

jest.mock('../handoverCustomizationConfiguration.utils')

describe('handoverCustomizationOnlineSettingsForm.utils', () => {
    describe('initialFormFieldValues', () => {
        it('should have the correct default values', () => {
            expect(initialFormFieldValues).toEqual({
                onlineInstructions: '',
                emailCaptureEnabled: true,
                emailCaptureEnforcement: GorgiasChatEmailCaptureType.Optional,
                autoResponderEnabled: true,
                autoResponderReply: GorgiasChatAutoResponderReply.ReplyDynamic,
            })
        })
    })

    describe('formFieldsConfiguration', () => {
        it('should have the correct configuration for each field', () => {
            expect(formFieldsConfiguration.onlineInstructions).toEqual({
                friendlyName: 'Online instructions',
                required: false,
                maxLength: 255,
            })
            expect(formFieldsConfiguration.emailCaptureEnabled).toEqual({
                friendlyName: 'Enable email capture',
                required: false,
            })
            expect(formFieldsConfiguration.emailCaptureEnforcement).toEqual({
                friendlyName: 'Email capture enforcement option',
                required: false,
            })
            expect(formFieldsConfiguration.autoResponderEnabled).toEqual({
                friendlyName: 'Enable send wait time',
                required: false,
            })
        })
    })

    describe('getIntegrationPreferencesFormDataFragment', () => {
        const mockIntegration: GorgiasChatIntegration = {
            id: 1,
            meta: {
                preferences: {
                    email_capture_enabled: true,
                    email_capture_enforcement:
                        GorgiasChatEmailCaptureType.Optional,
                    auto_responder: {
                        enabled: true,
                        reply: GorgiasChatAutoResponderReply.ReplyInDay,
                    },
                },
            },
        } as unknown as GorgiasChatIntegration

        it('should extract preferences from integration correctly', () => {
            const result =
                getIntegrationPreferencesFormDataFragment(mockIntegration)

            expect(result).toEqual({
                emailCaptureEnabled: true,
                emailCaptureEnforcement: GorgiasChatEmailCaptureType.Optional,
                autoResponderEnabled: true,
                autoResponderReply: GorgiasChatAutoResponderReply.ReplyInDay,
            })
        })

        it('should use default values when preferences are missing', () => {
            const integrationWithoutPreferences = {
                id: 1,
                meta: {},
            } as GorgiasChatIntegration

            const result = getIntegrationPreferencesFormDataFragment(
                integrationWithoutPreferences,
            )

            expect(result).toEqual({
                emailCaptureEnabled: initialFormFieldValues.emailCaptureEnabled,
                emailCaptureEnforcement:
                    initialFormFieldValues.emailCaptureEnforcement,
                autoResponderEnabled:
                    initialFormFieldValues.autoResponderEnabled,
                autoResponderReply: initialFormFieldValues.autoResponderReply,
            })
        })
    })

    describe('getHandoverConfigurationFormDataFragment', () => {
        it('should extract online instructions from configuration', () => {
            const mockConfig = {
                onlineInstructions: 'Test instructions',
            } as unknown as HandoverConfigurationData

            const result = getHandoverConfigurationFormDataFragment(mockConfig)
            expect(result).toEqual({ onlineInstructions: 'Test instructions' })
        })

        it('should return empty string when configuration is undefined', () => {
            const result = getHandoverConfigurationFormDataFragment(undefined)
            expect(result).toEqual({
                onlineInstructions: initialFormFieldValues.onlineInstructions,
            })
        })
    })

    describe('hasAnyChangeInFormValues', () => {
        it('should detect changes in form values', () => {
            const currentValues = { field1: 'new', field2: 'value' }
            const originalValues = { field1: 'old', field2: 'value' }

            expect(
                hasAnyChangeInFormValues(currentValues, originalValues),
            ).toBe(true)
        })

        it('should return false when no changes', () => {
            const currentValues = { field1: 'same', field2: 'value' }
            const originalValues = { field1: 'same', field2: 'value' }

            expect(
                hasAnyChangeInFormValues(currentValues, originalValues),
            ).toBe(false)
        })
    })

    describe('mapFromFormValuesToIntegrationPreferences', () => {
        const mockFormValues = {
            onlineInstructions: 'Test',
            emailCaptureEnabled: true,
            emailCaptureEnforcement:
                GorgiasChatEmailCaptureType.RequiredOutsideBusinessHours,
            autoResponderEnabled: true,
            autoResponderReply: GorgiasChatAutoResponderReply.ReplyInDay,
        }

        const mockIntegration = {
            id: 1,
            deactivated_datetime: null,
            meta: {
                preferences: {
                    some_existing_pref: 'value',
                },
            },
        } as unknown as GorgiasChatIntegration

        it('should correctly map form values to integration preferences', () => {
            const result = mapFromFormValuesToIntegrationPreferences(
                mockFormValues,
                mockIntegration,
            )

            expect(result.toJS()).toEqual({
                id: 1,
                meta: {
                    preferences: {
                        some_existing_pref: 'value',
                        email_capture_enabled: true,
                        email_capture_enforcement:
                            GorgiasChatEmailCaptureType.RequiredOutsideBusinessHours,
                        auto_responder: {
                            enabled: true,
                            reply: GorgiasChatAutoResponderReply.ReplyInDay,
                        },
                    },
                },
            })
        })
    })
})
