import { HandoverConfigurationData } from 'models/aiAgent/types'
import { IntegrationType } from 'models/integration/constants'
import {
    GorgiasChatAutoResponderReply,
    GorgiasChatEmailCaptureType,
} from 'models/integration/types'
import { AiAgentChannel } from 'pages/aiAgent/constants'
import {
    HandoverCustomizationOfflineSettingsFormValues,
    HandoverCustomizationOnlineSettingsFormValues,
} from 'pages/aiAgent/types'

import {
    createHandoverConfigurationData,
    mapFormValuesToHandoverConfigurationData,
} from '../handoverCustomizationConfigurationData.utils'

const allIntegrationTypes = Object.values(IntegrationType)

// Filter out the supported types
const supportedTypes = [IntegrationType.GorgiasChat, IntegrationType.Email]
const unsupportedTypes = allIntegrationTypes.filter(
    (type) => !supportedTypes.includes(type),
)

// Add an invalid type for edge case testing
unsupportedTypes.push('unsupported' as IntegrationType)

describe('handoverCustomizationConfigurationData.utils', () => {
    const mockAccountId = 123
    const mockStoreName = 'Test Store'
    const mockShopType = 'shopify'
    const mockIntegrationId = 456

    describe('createHandoverConfigurationData', () => {
        it('should create configuration data for chat integration', () => {
            const result = createHandoverConfigurationData({
                accountId: mockAccountId,
                storeName: mockStoreName,
                shopType: mockShopType,
                integrationId: mockIntegrationId,
                integrationType: IntegrationType.GorgiasChat,
            })

            expect(result).toEqual({
                accountId: mockAccountId,
                storeName: mockStoreName,
                shopType: mockShopType,
                integrationId: mockIntegrationId,
                channel: AiAgentChannel.Chat,
                onlineInstructions: null,
                offlineInstructions: null,
                shareBusinessHours: false,
            })
        })

        it('should create configuration data for email integration', () => {
            const result = createHandoverConfigurationData({
                accountId: mockAccountId,
                storeName: mockStoreName,
                shopType: mockShopType,
                integrationId: mockIntegrationId,
                integrationType: IntegrationType.Email,
            })

            expect(result).toEqual({
                accountId: mockAccountId,
                storeName: mockStoreName,
                shopType: mockShopType,
                integrationId: mockIntegrationId,
                channel: AiAgentChannel.Email,
                onlineInstructions: null,
                offlineInstructions: null,
                shareBusinessHours: false,
            })
        })

        test.each(unsupportedTypes)(
            'should throw error for unsupported integration type %s',
            (type) => {
                expect(() =>
                    createHandoverConfigurationData({
                        accountId: mockAccountId,
                        storeName: mockStoreName,
                        shopType: mockShopType,
                        integrationId: mockIntegrationId,
                        integrationType: type,
                    }),
                ).toThrow(`Unsupported ai agent channel type: ${type}`)
            },
        )
    })

    describe('mapIntegrationTypeToAiAgentChannel', () => {
        it('should map GorgiasChat to Chat channel', () => {
            const result = createHandoverConfigurationData({
                accountId: mockAccountId,
                storeName: mockStoreName,
                shopType: mockShopType,
                integrationId: mockIntegrationId,
                integrationType: IntegrationType.GorgiasChat,
            })
            expect(result.channel).toBe(AiAgentChannel.Chat)
        })

        it('should map Email to Email channel', () => {
            const result = createHandoverConfigurationData({
                accountId: mockAccountId,
                storeName: mockStoreName,
                shopType: mockShopType,
                integrationId: mockIntegrationId,
                integrationType: IntegrationType.Email,
            })
            expect(result.channel).toBe(AiAgentChannel.Email)
        })

        test.each(unsupportedTypes)(
            'should throw error for unsupported integration type %s',
            (type) => {
                expect(() =>
                    createHandoverConfigurationData({
                        accountId: mockAccountId,
                        storeName: mockStoreName,
                        shopType: mockShopType,
                        integrationId: mockIntegrationId,
                        integrationType: type,
                    }),
                ).toThrow(`Unsupported ai agent channel type: ${type}`)
            },
        )
    })

    describe('mapFormValuesToHandoverConfigurationData', () => {
        const mockAccountId = 123
        const mockStoreName = 'Test Store'
        const mockShopType = 'shopify'
        const mockIntegrationId = 456

        const mockOfflineInstructionsFormValues: HandoverCustomizationOfflineSettingsFormValues =
            {
                offlineInstructions: 'Offline instructions',
                shareBusinessHours: true,
            }

        const mockOnlineInstructionsFormValues: HandoverCustomizationOnlineSettingsFormValues =
            {
                onlineInstructions: 'Online instructions',
                emailCaptureEnabled: true,
                emailCaptureEnforcement:
                    GorgiasChatEmailCaptureType.RequiredOutsideBusinessHours,
                autoResponderEnabled: true,
                autoResponderReply:
                    GorgiasChatAutoResponderReply.ReplyInMinutes,
            }

        it('should create new configuration when none exists', () => {
            const result = mapFormValuesToHandoverConfigurationData({
                accountId: mockAccountId,
                storeName: mockStoreName,
                shopType: mockShopType,
                integrationId: mockIntegrationId,
                integrationType: IntegrationType.GorgiasChat,
                formValues: {} as unknown as Parameters<
                    typeof mapFormValuesToHandoverConfigurationData
                >[0]['formValues'],
            })

            expect(result).toEqual({
                accountId: mockAccountId,
                storeName: mockStoreName,
                shopType: mockShopType,
                integrationId: mockIntegrationId,
                channel: AiAgentChannel.Chat,
                onlineInstructions: null,
                offlineInstructions: null,
                shareBusinessHours: false,
            })
        })

        test.each([
            [
                'online-instructions',
                mockOnlineInstructionsFormValues,
                {
                    onlineInstructions: 'Online instructions',
                },
            ],
            [
                'offline-instructions',
                mockOfflineInstructionsFormValues,
                {
                    offlineInstructions: 'Offline instructions',
                    shareBusinessHours: true,
                },
            ],
        ])(
            'should create new configuration with %s form values',
            (_, formValues, expected) => {
                const result = mapFormValuesToHandoverConfigurationData({
                    accountId: mockAccountId,
                    storeName: mockStoreName,
                    shopType: mockShopType,
                    integrationId: mockIntegrationId,
                    integrationType: IntegrationType.GorgiasChat,
                    formValues,
                })

                const newConfiguration = {
                    accountId: mockAccountId,
                    storeName: mockStoreName,
                    shopType: mockShopType,
                    integrationId: mockIntegrationId,
                    channel: AiAgentChannel.Chat,
                    onlineInstructions: null,
                    offlineInstructions: null,
                    shareBusinessHours: false,
                }

                const expectedNewObject = { ...newConfiguration, ...expected }

                expect(result).toEqual(expectedNewObject)
            },
        )

        test.each([
            [
                'online-instructions',
                mockOnlineInstructionsFormValues,
                {
                    onlineInstructions: 'Online instructions',
                },
            ],
            [
                'offline-instructions',
                mockOfflineInstructionsFormValues,
                {
                    offlineInstructions: 'Offline instructions',
                    shareBusinessHours: true,
                },
            ],
        ])(
            'should create new configuration with %s form values',
            (_, formValues, expected) => {
                const result = mapFormValuesToHandoverConfigurationData({
                    accountId: mockAccountId,
                    storeName: mockStoreName,
                    shopType: mockShopType,
                    integrationId: mockIntegrationId,
                    integrationType: IntegrationType.GorgiasChat,
                    formValues,
                })

                const newConfiguration = {
                    accountId: mockAccountId,
                    storeName: mockStoreName,
                    shopType: mockShopType,
                    integrationId: mockIntegrationId,
                    channel: AiAgentChannel.Chat,
                    onlineInstructions: null,
                    offlineInstructions: null,
                    shareBusinessHours: false,
                }

                const expectedNewObject = { ...newConfiguration, ...expected }

                expect(result).toEqual(expectedNewObject)
            },
        )

        it('should update existing configuration when online form values are provided', () => {
            const existingConfig: HandoverConfigurationData = {
                accountId: mockAccountId,
                storeName: mockStoreName,
                shopType: mockShopType,
                integrationId: mockIntegrationId,
                channel: AiAgentChannel.Chat,
                onlineInstructions: 'Old instructions',
                offlineInstructions: 'Offline instructions',
                shareBusinessHours: false,
            }

            const result = mapFormValuesToHandoverConfigurationData({
                accountId: mockAccountId,
                storeName: mockStoreName,
                shopType: mockShopType,
                integrationId: mockIntegrationId,
                integrationType: IntegrationType.GorgiasChat,
                formValues: {
                    ...mockOnlineInstructionsFormValues,
                    onlineInstructions: 'New instructions',
                },
                configuration: existingConfig,
            })

            expect(result).toEqual({
                ...existingConfig,
                onlineInstructions: 'New instructions',
            })
        })

        it('should update existing configuration when online form values are provided', () => {
            const existingConfig: HandoverConfigurationData = {
                accountId: mockAccountId,
                storeName: mockStoreName,
                shopType: mockShopType,
                integrationId: mockIntegrationId,
                channel: AiAgentChannel.Chat,
                onlineInstructions: 'Online instructions',
                offlineInstructions: 'Old instructions',
                shareBusinessHours: false,
            }

            const result = mapFormValuesToHandoverConfigurationData({
                accountId: mockAccountId,
                storeName: mockStoreName,
                shopType: mockShopType,
                integrationId: mockIntegrationId,
                integrationType: IntegrationType.GorgiasChat,
                formValues: {
                    ...mockOfflineInstructionsFormValues,
                    offlineInstructions: 'New instructions',
                    shareBusinessHours: true,
                },
                configuration: existingConfig,
            })

            expect(result).toEqual({
                ...existingConfig,
                offlineInstructions: 'New instructions',
                shareBusinessHours: true,
            })
        })

        it('when the online instructions field is empty, it should be set to null', () => {
            const result = mapFormValuesToHandoverConfigurationData({
                accountId: mockAccountId,
                storeName: mockStoreName,
                shopType: mockShopType,
                integrationId: mockIntegrationId,
                integrationType: IntegrationType.GorgiasChat,
                formValues: {
                    ...mockOnlineInstructionsFormValues,
                    onlineInstructions: '',
                },
            })

            expect(result).toEqual(
                expect.objectContaining({
                    onlineInstructions: null,
                }),
            )
        })

        it('when the offline instructions field is empty, it should be set to null', () => {
            const result = mapFormValuesToHandoverConfigurationData({
                accountId: mockAccountId,
                storeName: mockStoreName,
                shopType: mockShopType,
                integrationId: mockIntegrationId,
                integrationType: IntegrationType.GorgiasChat,
                formValues: {
                    ...mockOfflineInstructionsFormValues,
                    offlineInstructions: '',
                },
            })

            expect(result).toEqual(
                expect.objectContaining({
                    offlineInstructions: null,
                }),
            )
        })
    })
})
