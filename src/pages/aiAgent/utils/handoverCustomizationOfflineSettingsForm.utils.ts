import { HandoverConfigurationData } from 'models/aiAgent/types'
import { IntegrationType } from 'models/integration/types'

import { AiAgentChannel } from '../constants'
import { AiAgentStoreHandoverConfiguration } from '../hooks/useFetchAiAgentHandoverConfiguration'
import { HandoverCustomizationOfflineSettingsFormValues } from '../types'

const initialFormFieldValues: HandoverCustomizationOfflineSettingsFormValues = {
    offlineInstructions: '',
    shareBusinessHours: false,
}

/**
 * This object maps each field from the fallback settings form to its configuration.
 * it contains the friendly name of the field and validation constraints
 */
export const formFieldsConfiguration: Record<
    keyof HandoverCustomizationOfflineSettingsFormValues,
    {
        required: boolean
        friendlyName: string
        maxLength?: number
    }
> = {
    offlineInstructions: {
        friendlyName: 'Offline instructions',
        required: false,
        maxLength: 255,
    },
    shareBusinessHours: {
        friendlyName: 'Share business hours',
        required: false,
    },
}

/**
 * This function returns the initial form values for the fallback settings form for each language in the integration
 * @param integration - The integration metadata
 * @returns The initial form values
 */
export const getInitialFormValues = () => {
    return initialFormFieldValues
}

const mapIntegrationTypeToAiAgentChannel = (type: IntegrationType) => {
    switch (type) {
        case IntegrationType.GorgiasChat:
            return AiAgentChannel.Chat
        case IntegrationType.Email:
            return AiAgentChannel.Email
        default:
            // TODO check if this is correct
            return AiAgentChannel.Chat
    }
}

const createBaseHandoverConfigurationData = (
    accountId: number,
    storeName: string,
    shopType: string,
    integrationId: number,
    type: IntegrationType,
): HandoverConfigurationData => {
    return {
        accountId,
        storeName,
        shopType,
        integrationId,
        channel: mapIntegrationTypeToAiAgentChannel(type),
        onlineInstructions: null,
        offlineInstructions: null,
        shareBusinessHours: false,
    }
}

/**
 * This function maps the handover customization offline form values to the handover configuration data
 * @param accountId - The account id
 * @param storeName - The store name
 * @param shopType - The shop type
 * @param integrationId - The integration id
 * @param type - The integration type
 * @param formValues - The form values
 * @param configuration - The current configuration data
 * @returns The handover configuration data
 */
export const mapFormValuesToHandoverConfigurationData = (
    accountId: number,
    storeName: string,
    shopType: string,
    integrationId: number,
    type: IntegrationType,
    formValues: HandoverCustomizationOfflineSettingsFormValues,
    configuration?: AiAgentStoreHandoverConfiguration,
): HandoverConfigurationData => {
    let newConfiguration = configuration
    if (!newConfiguration) {
        // in cases where the configuration is not uploaded yet, we create a new one
        newConfiguration = createBaseHandoverConfigurationData(
            accountId,
            storeName,
            shopType,
            integrationId,
            type,
        )
    }

    return {
        ...newConfiguration,
        offlineInstructions: formValues.offlineInstructions,
        shareBusinessHours: formValues.shareBusinessHours,
    }
}
