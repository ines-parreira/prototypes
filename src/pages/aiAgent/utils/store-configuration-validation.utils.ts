import { AiAgentOnboardingWizardStep } from 'models/aiAgent/types'

import {
    AiAgentChannel,
    CUSTOM_TONE_OF_VOICE_MAX_LENGTH,
    EXCLUDED_TOPIC_MAX_LENGTH,
    MAX_EXCLUDED_TOPICS,
    SIGNATURE_MAX_LENGTH,
    ToneOfVoice,
} from '../constants'
import { useAiAgentNavigation } from '../hooks/useAiAgentNavigation'
import { FormValues, ValidFormValues } from '../types'

export enum StoreConfigurationValidationMessage {
    SignatureEmpty = 'Signature cannot be empty',
    SignatureLength = `Signature must be less than ${SIGNATURE_MAX_LENGTH} characters`,
    ExcludedTopicEmpty = 'Excluded topic cannot be empty',
    ExcludedTopicsLength = `Excluded topics must be less than ${MAX_EXCLUDED_TOPICS}`,
    ExcludedTopicLength = `Excluded topics must be less than ${EXCLUDED_TOPIC_MAX_LENGTH} characters`,
    TagsEmpty = 'Tags must have a name and description',
    CustomToneOfVoiceEmpty = 'Custom tone of voice cannot be empty',
    CustomToneOfVoiceLength = `Custom tone of voice should be less than ${CUSTOM_TONE_OF_VOICE_MAX_LENGTH} characters`,
    HelpCenterEmpty = 'Select a Help Center or add at least one public URL',
    EmailIntegrationError = 'Please select at least 1 email integration for AI Agent to use or disable AI Agent for email to proceed.',
    ChatIntegrationError = 'Please select at least 1 chat integration for AI Agent to use or disable AI Agent for chat to proceed.',
    ChatIntegrationUninstalledError = 'All selected chat integrations need to be installed to continue.',
    NoChannelError = 'At least one channel must be selected.',
    HelpCenterError = 'You must add at least one knowledge source to continue.',
    FieldsMissing = 'One or more required fields not filled.',
}

export enum ConfigurationPage {
    SettingsChannels = 'settings-channels',
    OnboardingWizard = 'onboarding-wizard',
}

const isEmailIntegrationMissing = (formValues: FormValues) =>
    formValues.monitoredEmailIntegrations?.length === 0

const isChatIntegrationMissing = (formValues: FormValues) =>
    formValues.monitoredChatIntegrations?.length === 0

const simplifyWizardErrors = (formValues: FormValues, message: string) => {
    if (formValues.wizard) {
        return StoreConfigurationValidationMessage.FieldsMissing
    }
    return message
}

export const getConfigurationPage = ({
    routes,
    pathname,
}: Pick<ReturnType<typeof useAiAgentNavigation>, 'routes'> & {
    pathname: string
}): ConfigurationPage | undefined => {
    if (pathname.includes(routes.settingsChannels)) {
        return ConfigurationPage.SettingsChannels
    }

    if (pathname.includes(routes.onboardingWizard)) {
        return ConfigurationPage.OnboardingWizard
    }
}

export const getValidStoreConfigurationFormValues = (
    formValues: FormValues,
    publicUrls: string[] | null | undefined,
    hasExternalFiles: boolean,
    opts: {
        configurationPage?: ConfigurationPage
        isAiAgentChatEnabled: boolean | undefined
    },
): ValidFormValues => {
    const isWizardStepKnowledgeOrCompleted =
        formValues.wizard?.stepName === AiAgentOnboardingWizardStep.Knowledge ||
        formValues.wizard?.completedDatetime !== null

    const isWizardNotFinished =
        !formValues.wizard || isWizardStepKnowledgeOrCompleted

    // Validate signature only when email channel is activated
    if (formValues.emailChannelDeactivatedDatetime === null) {
        if (formValues.signature !== null) {
            if (formValues.signature.length > SIGNATURE_MAX_LENGTH) {
                throw new Error(
                    StoreConfigurationValidationMessage.SignatureLength,
                )
            }
        }

        if (
            (formValues.signature === null ||
                formValues.signature.trim().length === 0) &&
            isWizardNotFinished
        ) {
            throw new Error(
                simplifyWizardErrors(
                    formValues,
                    StoreConfigurationValidationMessage.SignatureEmpty,
                ),
            )
        }
    }

    if (formValues.tags !== null && formValues.tags.length > 0) {
        const hasEmptyFields = formValues.tags.some(
            (tag) => tag.name === '' || tag.description === '',
        )
        if (hasEmptyFields) {
            throw new Error(StoreConfigurationValidationMessage.TagsEmpty)
        }
    }

    if (
        (!formValues.toneOfVoice ||
            formValues.toneOfVoice === ToneOfVoice.Custom) &&
        formValues.customToneOfVoiceGuidance?.trim().length === 0 &&
        isWizardNotFinished
    ) {
        throw new Error(
            simplifyWizardErrors(
                formValues,
                StoreConfigurationValidationMessage.CustomToneOfVoiceEmpty,
            ),
        )
    }

    if (
        isEmailIntegrationMissing(formValues) &&
        formValues.emailChannelDeactivatedDatetime === null
    ) {
        throw new Error(
            StoreConfigurationValidationMessage.EmailIntegrationError,
        )
    }

    if (
        opts.isAiAgentChatEnabled &&
        isChatIntegrationMissing(formValues) &&
        formValues.chatChannelDeactivatedDatetime === null
    ) {
        throw new Error(
            StoreConfigurationValidationMessage.ChatIntegrationError,
        )
    }

    // Wizard related validations
    if (
        opts.configurationPage === ConfigurationPage.OnboardingWizard &&
        formValues.wizard
    ) {
        // we must have at least one channel selected in the wizard
        if (
            formValues.wizard.enabledChannels &&
            formValues.wizard.enabledChannels.length === 0 &&
            isWizardStepKnowledgeOrCompleted
        ) {
            throw new Error(StoreConfigurationValidationMessage.NoChannelError)
        }

        // we must have integration for selected channel
        if (
            formValues.wizard.enabledChannels &&
            formValues.wizard.enabledChannels.includes(AiAgentChannel.Email) &&
            formValues.monitoredEmailIntegrations?.length === 0 &&
            formValues.wizard.completedDatetime === null &&
            formValues.wizard.stepName === AiAgentOnboardingWizardStep.Knowledge
        ) {
            throw new Error(StoreConfigurationValidationMessage.FieldsMissing)
        }

        if (
            formValues.wizard.enabledChannels &&
            formValues.wizard.enabledChannels.includes(AiAgentChannel.Chat) &&
            formValues.monitoredChatIntegrations?.length === 0 &&
            formValues.wizard.completedDatetime === null &&
            formValues.wizard.stepName === AiAgentOnboardingWizardStep.Knowledge
        ) {
            throw new Error(StoreConfigurationValidationMessage.FieldsMissing)
        }
    }

    if (
        (!formValues.toneOfVoice ||
            formValues.toneOfVoice === ToneOfVoice.Custom) &&
        formValues.customToneOfVoiceGuidance &&
        formValues.customToneOfVoiceGuidance.length >
            CUSTOM_TONE_OF_VOICE_MAX_LENGTH
    ) {
        throw new Error(
            StoreConfigurationValidationMessage.CustomToneOfVoiceLength,
        )
    }

    const isKnowledgeMissing =
        formValues.helpCenterId === null &&
        !hasExternalFiles &&
        (!publicUrls || publicUrls.length === 0)

    if (
        isKnowledgeMissing &&
        (!formValues.wizard || formValues.wizard.completedDatetime !== null) &&
        opts.configurationPage === ConfigurationPage.OnboardingWizard
    ) {
        throw new Error(StoreConfigurationValidationMessage.HelpCenterError)
    }

    if (
        opts.configurationPage === ConfigurationPage.SettingsChannels &&
        isKnowledgeMissing &&
        (formValues.chatChannelDeactivatedDatetime === null ||
            formValues.emailChannelDeactivatedDatetime === null)
    ) {
        throw new Error(StoreConfigurationValidationMessage.HelpCenterError)
    }

    return {
        ...formValues,
        // Need to explicitly set these fields to non-null
        signature: formValues.signature || '',
        monitoredEmailIntegrations: formValues.monitoredEmailIntegrations || [],
        monitoredChatIntegrations: formValues.monitoredChatIntegrations || [],
    }
}
