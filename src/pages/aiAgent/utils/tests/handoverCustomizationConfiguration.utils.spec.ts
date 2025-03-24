import { IntegrationType } from 'models/integration/constants'
import { AiAgentChannel } from 'pages/aiAgent/constants'
import { HandoverCustomizationOfflineSettingsFormValues } from 'pages/aiAgent/types'

import { createHandoverConfigurationData } from '../handoverCustomizationConfiguration.utils'
import { mapFormValuesToHandoverConfigurationData } from '../handoverCustomizationOfflineSettingsForm.utils'

const allIntegrationTypes = Object.values(IntegrationType)

// Filter out the supported types
const supportedTypes = [IntegrationType.GorgiasChat, IntegrationType.Email]
const unsupportedTypes = allIntegrationTypes.filter(
    (type) => !supportedTypes.includes(type),
)

// Add an invalid type for edge case testing
unsupportedTypes.push('unsupported' as IntegrationType)

describe('createBaseHandoverConfigurationData', () => {
    const mockAccountId = 123
    const mockStoreName = 'Test Store'
    const mockShopType = 'shopify'
    const mockIntegrationId = 456

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

describe('handoverCustomizationConfiguration.utils', () => {
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
                onlineInstructions: undefined,
                offlineInstructions: undefined,
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
                onlineInstructions: undefined,
                offlineInstructions: undefined,
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
})
