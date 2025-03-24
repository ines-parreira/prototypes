import { IntegrationType } from 'models/integration/constants'

import { AiAgentChannel } from '../../constants'
import { AiAgentStoreHandoverConfiguration } from '../../hooks/useFetchAiAgentHandoverConfiguration'
import { HandoverCustomizationOfflineSettingsFormValues } from '../../types'
import {
    getInitialFormValues,
    mapFormValuesToHandoverConfigurationData,
} from '../handoverCustomizationOfflineSettingsForm.utils'

describe('handoverCustomizationOfflineSettingsForm.utils', () => {
    describe('getInitialFormValues', () => {
        it('should return initial form values with empty fields', () => {
            const initialFormValues = getInitialFormValues()

            expect(initialFormValues).toEqual({
                offlineInstructions: '',
                shareBusinessHours: false,
            })
        })
    })

    describe('mapFormValuesToHandoverConfigurationData', () => {
        const mockAccountId = 123
        const mockStoreName = 'Test Store'
        const mockShopType = 'shopify'
        const mockIntegrationId = 456

        describe('when mapping form values for chat integration', () => {
            it('should create a new configuration with chat channel when configuration is undefined', () => {
                const formValues: HandoverCustomizationOfflineSettingsFormValues =
                    {
                        offlineInstructions: 'Custom offline instructions',
                        shareBusinessHours: true,
                    }

                const result = mapFormValuesToHandoverConfigurationData({
                    accountId: mockAccountId,
                    storeName: mockStoreName,
                    shopType: mockShopType,
                    integrationId: mockIntegrationId,
                    integrationType: IntegrationType.GorgiasChat,
                    formValues,
                })

                expect(result).toEqual({
                    accountId: mockAccountId,
                    storeName: mockStoreName,
                    shopType: mockShopType,
                    integrationId: mockIntegrationId,
                    channel: AiAgentChannel.Chat,
                    onlineInstructions: undefined,
                    offlineInstructions: 'Custom offline instructions',
                    shareBusinessHours: true,
                })
            })

            it('should update an existing configuration', () => {
                const formValues: HandoverCustomizationOfflineSettingsFormValues =
                    {
                        offlineInstructions: 'Updated offline instructions',
                        shareBusinessHours: false,
                    }

                const existingConfiguration: AiAgentStoreHandoverConfiguration =
                    {
                        accountId: mockAccountId,
                        storeName: mockStoreName,
                        shopType: mockShopType,
                        integrationId: mockIntegrationId,
                        channel: AiAgentChannel.Chat,
                        onlineInstructions: 'Existing online instructions',
                        offlineInstructions: 'Existing offline instructions',
                        shareBusinessHours: true,
                    }

                const result = mapFormValuesToHandoverConfigurationData({
                    accountId: mockAccountId,
                    storeName: mockStoreName,
                    shopType: mockShopType,
                    integrationId: mockIntegrationId,
                    integrationType: IntegrationType.GorgiasChat,
                    formValues,
                    configuration: existingConfiguration,
                })

                expect(result).toEqual({
                    ...existingConfiguration,
                    offlineInstructions: 'Updated offline instructions',
                    shareBusinessHours: false,
                })
            })
        })

        describe('when mapping form values for email integration', () => {
            it('should create a new configuration with email channel when configuration is undefined', () => {
                const formValues: HandoverCustomizationOfflineSettingsFormValues =
                    {
                        offlineInstructions: 'New Email offline instructions',
                        shareBusinessHours: true,
                    }

                const result = mapFormValuesToHandoverConfigurationData({
                    accountId: mockAccountId,
                    storeName: mockStoreName,
                    shopType: mockShopType,
                    integrationId: mockIntegrationId,
                    integrationType: IntegrationType.Email,
                    formValues,
                })

                expect(result).toEqual({
                    accountId: mockAccountId,
                    storeName: mockStoreName,
                    shopType: mockShopType,
                    integrationId: mockIntegrationId,
                    channel: AiAgentChannel.Email,
                    onlineInstructions: undefined,
                    offlineInstructions: 'New Email offline instructions',
                    shareBusinessHours: true,
                })
            })

            it('should update an existing configuration for the email channel', () => {
                const formValues: HandoverCustomizationOfflineSettingsFormValues =
                    {
                        offlineInstructions:
                            'Updated Email offline instructions',
                        shareBusinessHours: false,
                    }

                const existingConfiguration: AiAgentStoreHandoverConfiguration =
                    {
                        accountId: mockAccountId,
                        storeName: mockStoreName,
                        shopType: mockShopType,
                        integrationId: mockIntegrationId,
                        channel: AiAgentChannel.Email,
                        onlineInstructions:
                            'Existing Email online instructions',
                        offlineInstructions:
                            'Existing Email offline instructions',
                        shareBusinessHours: true,
                    }

                const result = mapFormValuesToHandoverConfigurationData({
                    accountId: mockAccountId,
                    storeName: mockStoreName,
                    shopType: mockShopType,
                    integrationId: mockIntegrationId,
                    integrationType: IntegrationType.Email,
                    formValues,
                    configuration: existingConfiguration,
                })

                expect(result).toEqual({
                    ...existingConfiguration,
                    offlineInstructions: 'Updated Email offline instructions',
                    shareBusinessHours: false,
                })
            })
        })

        describe('createBaseHandoverConfigurationData', () => {
            it('should create base configuration with default values when no existing configuration is provided with chat integration', () => {
                const emptyFormValues: HandoverCustomizationOfflineSettingsFormValues =
                    {
                        offlineInstructions: '',
                        shareBusinessHours: false,
                    }

                const result = mapFormValuesToHandoverConfigurationData({
                    accountId: mockAccountId,
                    storeName: mockStoreName,
                    shopType: mockShopType,
                    integrationId: mockIntegrationId,
                    integrationType: IntegrationType.GorgiasChat,
                    formValues: emptyFormValues,
                })

                expect(result).toEqual({
                    accountId: mockAccountId,
                    storeName: mockStoreName,
                    shopType: mockShopType,
                    integrationId: mockIntegrationId,
                    channel: AiAgentChannel.Chat,
                    onlineInstructions: undefined,
                    offlineInstructions: '',
                    shareBusinessHours: false,
                })
            })

            it('should create base configuration with default values when no existing configuration is provided with email integration', () => {
                const emptyFormValues: HandoverCustomizationOfflineSettingsFormValues =
                    {
                        offlineInstructions: '',
                        shareBusinessHours: false,
                    }

                const result = mapFormValuesToHandoverConfigurationData({
                    accountId: mockAccountId,
                    storeName: mockStoreName,
                    shopType: mockShopType,
                    integrationId: mockIntegrationId,
                    integrationType: IntegrationType.Email,
                    formValues: emptyFormValues,
                })

                expect(result).toEqual({
                    accountId: mockAccountId,
                    storeName: mockStoreName,
                    shopType: mockShopType,
                    integrationId: mockIntegrationId,
                    channel: AiAgentChannel.Email,
                    offlineInstructions: '',
                    onlineInstructions: undefined,
                    shareBusinessHours: false,
                })
            })
        })

        describe('when updating an existing configuration', () => {
            it('should update form values while preserving other configuration fields', () => {
                const formValues: HandoverCustomizationOfflineSettingsFormValues =
                    {
                        offlineInstructions: 'New offline instructions',
                        shareBusinessHours: true,
                    }

                const existingConfiguration: AiAgentStoreHandoverConfiguration =
                    {
                        accountId: mockAccountId,
                        storeName: mockStoreName,
                        shopType: mockShopType,
                        integrationId: mockIntegrationId,
                        channel: AiAgentChannel.Email,
                        onlineInstructions: 'Existing online instructions',
                        offlineInstructions: 'Existing offline instructions',
                        shareBusinessHours: false,
                    }

                const result = mapFormValuesToHandoverConfigurationData({
                    accountId: mockAccountId,
                    storeName: mockStoreName,
                    shopType: mockShopType,
                    integrationId: mockIntegrationId,
                    integrationType: IntegrationType.Email,
                    formValues,
                    configuration: existingConfiguration,
                })

                // The result should contain existing configuration with only form values updated
                expect(result).toEqual({
                    accountId: mockAccountId,
                    storeName: mockStoreName,
                    shopType: mockShopType,
                    integrationId: mockIntegrationId,
                    channel: AiAgentChannel.Email,
                    onlineInstructions: 'Existing online instructions',
                    offlineInstructions: 'New offline instructions',
                    shareBusinessHours: true,
                })
            })
        })
    })
})
