import { fromJS } from 'immutable'

import {
    GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ENABLED_DEFAULT,
} from 'config/integrations/gorgias_chat'
import { HandoverConfigurationData } from 'models/aiAgent/types'
import {
    GorgiasChatAutoResponderReply,
    GorgiasChatEmailCaptureType,
    GorgiasChatIntegration,
    GorgiasChatIntegrationMeta,
} from 'models/integration/types'
import { HandoverCustomizationChatOnlineSettingsFormValues } from 'pages/aiAgent/types'

export const initialFormFieldValues: HandoverCustomizationChatOnlineSettingsFormValues =
    {
        onlineInstructions: '',
        emailCaptureEnabled: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ENABLED_DEFAULT,
        emailCaptureEnforcement: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
        autoResponderEnabled: GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
        autoResponderReply: GorgiasChatAutoResponderReply.ReplyDynamic,
    }

/**
 * This object maps each field from the settings form to its configuration.
 * it contains the friendly name of the field and validation constraints
 */
export const formFieldsConfiguration: Record<
    keyof HandoverCustomizationChatOnlineSettingsFormValues,
    {
        required: boolean
        friendlyName: string
        maxLength?: number
    }
> = {
    onlineInstructions: {
        friendlyName: 'Online instructions',
        required: false,
        maxLength: 255,
    },
    emailCaptureEnabled: {
        friendlyName: 'Enable email capture',
        required: false,
    },
    emailCaptureEnforcement: {
        friendlyName: 'Email capture enforcement option',
        required: false,
    },
    autoResponderEnabled: {
        friendlyName: 'Enable send wait time',
        required: false,
    },
    autoResponderReply: {
        friendlyName: 'Send wait time option',
        required: false,
    },
}

export const getIntegrationPreferencesFormDataFragment = (
    integration: GorgiasChatIntegration,
): Pick<
    HandoverCustomizationChatOnlineSettingsFormValues,
    | 'emailCaptureEnabled'
    | 'emailCaptureEnforcement'
    | 'autoResponderEnabled'
    | 'autoResponderReply'
> => {
    /// from the integration preferences
    const { meta } = integration

    const emailCaptureEnabled =
        meta?.preferences?.email_capture_enabled ??
        initialFormFieldValues.emailCaptureEnabled

    let emailCaptureEnforcement = (meta?.preferences
        ?.email_capture_enforcement ??
        initialFormFieldValues.emailCaptureEnforcement) as GorgiasChatEmailCaptureType

    // special case for deprecated email capture enforcement option
    if (
        emailCaptureEnforcement ===
        GorgiasChatEmailCaptureType.RequiredOutsideBusinessHours
    ) {
        emailCaptureEnforcement = GorgiasChatEmailCaptureType.Optional
    }

    const autoResponderEnabled =
        meta?.preferences?.auto_responder?.enabled ??
        initialFormFieldValues.autoResponderEnabled

    let autoResponderReply = (meta?.preferences?.auto_responder?.reply ??
        initialFormFieldValues.autoResponderReply) as GorgiasChatAutoResponderReply

    // special case for deprecated auto responder reply option
    if (autoResponderReply === GorgiasChatAutoResponderReply.ReplyShortly) {
        autoResponderReply = GorgiasChatAutoResponderReply.ReplyInMinutes
    }

    if (autoResponderReply === GorgiasChatAutoResponderReply.ReplyInDay) {
        autoResponderReply = GorgiasChatAutoResponderReply.ReplyInHours
    }

    return {
        emailCaptureEnabled,
        emailCaptureEnforcement,
        autoResponderEnabled,
        autoResponderReply,
    }
}

export const getHandoverConfigurationFormDataFragment = (
    currentHandoverConfiguration?: HandoverConfigurationData,
): Pick<
    HandoverCustomizationChatOnlineSettingsFormValues,
    'onlineInstructions'
> => {
    const onlineInstructions =
        currentHandoverConfiguration?.onlineInstructions ?? ''

    return {
        onlineInstructions,
    }
}

export const hasAnyChangeInFormValues = <T extends object>(
    currentValues: T,
    originalValues: Partial<T>,
) => {
    for (const key of Object.keys(currentValues)) {
        if (
            originalValues[key as keyof T] !== undefined &&
            currentValues[key as keyof T] !== originalValues[key as keyof T]
        ) {
            return true
        }
    }
    return false
}

export const mapFromFormValuesToIntegrationPreferences = (
    formValues: HandoverCustomizationChatOnlineSettingsFormValues,
    integration: GorgiasChatIntegration,
) => {
    const { meta } = integration

    const { preferences: currentPreferences } = meta

    const changedPreferences: GorgiasChatIntegrationMeta['preferences'] = {
        email_capture_enabled: formValues.emailCaptureEnabled,
        email_capture_enforcement: formValues.emailCaptureEnforcement,
        auto_responder: {
            enabled: formValues.autoResponderEnabled,
            reply: formValues.autoResponderReply,
        },
    }

    const newPreferences = currentPreferences
        ? { ...currentPreferences, ...changedPreferences }
        : changedPreferences

    const payload = {
        id: integration.id,
        meta: {
            ...meta,
            preferences: newPreferences,
        },
    }

    return fromJS(payload)
}
