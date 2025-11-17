import type { HandoverCustomizationChatOfflineSettingsFormValues } from 'pages/aiAgent/types'

export const initialFormFieldValues: HandoverCustomizationChatOfflineSettingsFormValues =
    {
        offlineInstructions: '',
        shareBusinessHours: false,
    }

/**
 * This object maps each field from the fallback settings form to its configuration.
 * it contains the friendly name of the field and validation constraints
 */
export const formFieldsConfiguration: Record<
    keyof HandoverCustomizationChatOfflineSettingsFormValues,
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
