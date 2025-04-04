import { HandoverConfigurationData } from 'models/aiAgent/types'
import { IntegrationType } from 'models/integration/constants'

import { AiAgentChannel } from '../../constants'
import {
    HandoverCustomizationOfflineSettingsFormValues,
    HandoverCustomizationOnlineSettingsFormValues,
} from '../../types'

const mapIntegrationTypeToAiAgentChannel = (type: IntegrationType) => {
    switch (type) {
        case IntegrationType.GorgiasChat:
            return AiAgentChannel.Chat
        case IntegrationType.Email:
            return AiAgentChannel.Email
        default:
            throw new Error(`Unsupported ai agent channel type: ${type}`)
    }
}

type CreateHandoverConfigurationDataProps = {
    accountId: number
    storeName: string
    shopType: string
    integrationId: number
    integrationType: IntegrationType
}

type HandoverCustomizationFormFormValues =
    | HandoverCustomizationOfflineSettingsFormValues
    | HandoverCustomizationOnlineSettingsFormValues

type MapFormValuesToHandoverConfigurationDataProps = {
    accountId: number
    storeName: string
    shopType: string
    integrationId: number
    integrationType: IntegrationType
    formValues: HandoverCustomizationFormFormValues
    configuration?: HandoverConfigurationData
}

export const createHandoverConfigurationData = ({
    accountId,
    storeName,
    shopType,
    integrationId,
    integrationType,
}: CreateHandoverConfigurationDataProps): HandoverConfigurationData => {
    return {
        accountId,
        storeName,
        shopType,
        integrationId,
        channel: mapIntegrationTypeToAiAgentChannel(integrationType),
        onlineInstructions: null,
        offlineInstructions: null,
        shareBusinessHours: false,
    }
}

export const mapFormValuesToHandoverConfigurationData = ({
    accountId,
    storeName,
    shopType,
    integrationId,
    integrationType,
    formValues,
    configuration,
}: MapFormValuesToHandoverConfigurationDataProps): HandoverConfigurationData => {
    let currentConfiguration = configuration
    if (!currentConfiguration) {
        // in cases where the configuration is not uploaded yet, we create a new one
        currentConfiguration = createHandoverConfigurationData({
            accountId,
            storeName,
            shopType,
            integrationId,
            integrationType,
        })
    }

    const newConfiguration = { ...currentConfiguration }

    if ('onlineInstructions' in formValues) {
        newConfiguration.onlineInstructions =
            formValues.onlineInstructions || null
    }

    if ('offlineInstructions' in formValues) {
        newConfiguration.offlineInstructions =
            formValues.offlineInstructions || null
    }

    if ('shareBusinessHours' in formValues) {
        newConfiguration.shareBusinessHours = formValues.shareBusinessHours
    }

    return newConfiguration
}
