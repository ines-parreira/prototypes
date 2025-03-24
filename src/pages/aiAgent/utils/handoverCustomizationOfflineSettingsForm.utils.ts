import { HandoverConfigurationData } from 'models/aiAgent/types'
import { IntegrationType } from 'models/integration/types'

import { AiAgentStoreHandoverConfiguration } from '../hooks/useFetchAiAgentHandoverConfiguration'
import { HandoverCustomizationOfflineSettingsFormValues } from '../types'
import { createHandoverConfigurationData } from './handoverCustomizationConfiguration.utils'

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

type MapFormValuesToHandoverConfigurationDataProps = {
    accountId: number
    storeName: string
    shopType: string
    integrationId: number
    integrationType: IntegrationType
    formValues: HandoverCustomizationOfflineSettingsFormValues
    configuration?: AiAgentStoreHandoverConfiguration
}

/**
 * This function maps the handover customization offline form values to the handover configuration data
 * @returns The handover configuration data
 */
export const mapFormValuesToHandoverConfigurationData = ({
    accountId,
    storeName,
    shopType,
    integrationId,
    integrationType,
    formValues,
    configuration,
}: MapFormValuesToHandoverConfigurationDataProps): HandoverConfigurationData => {
    let newConfiguration = configuration
    if (!newConfiguration) {
        // in cases where the configuration is not uploaded yet, we create a new one
        newConfiguration = createHandoverConfigurationData({
            accountId,
            storeName,
            shopType,
            integrationId,
            integrationType,
        })
    }

    return {
        ...newConfiguration,
        offlineInstructions: formValues.offlineInstructions,
        shareBusinessHours: formValues.shareBusinessHours,
    }
}
