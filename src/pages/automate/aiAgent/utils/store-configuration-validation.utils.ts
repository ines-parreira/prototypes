import {AiAgentOnboardingWizardStep} from 'models/aiAgent/types'
import {
    SIGNATURE_MAX_LENGTH,
    MAX_EXCLUDED_TOPICS,
    EXCLUDED_TOPIC_MAX_LENGTH,
    ToneOfVoice,
    AiAgentChannel,
    CUSTOM_TONE_OF_VOICE_MAX_LENGTH,
} from '../constants'
import {FormValues, ValidFormValues} from '../types'

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
    NoChannelError = 'At least one channel must be selected.',
    HelpCenterError = 'You must add at least one knowledge source to continue.',
    FieldsMissing = 'One or more required fields not filled.',
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

export const getValidStoreConfigurationFormValues = (
    formValues: FormValues,
    publicUrls: string[] | null | undefined,
    opts: {
        isOnboardingWizardPage: boolean
        isAiAgentChatEnabled: boolean | undefined
        isMultiChannelEnabled: boolean | undefined
    }
): ValidFormValues => {
    const isWizardStepKnowledgeOrCompleted =
        formValues.wizard?.stepName === AiAgentOnboardingWizardStep.Knowledge ||
        formValues.wizard?.completedDatetime !== null

    const isWizardNotFinished =
        !formValues.wizard || isWizardStepKnowledgeOrCompleted

    if (formValues.signature !== null) {
        if (formValues.signature.length > SIGNATURE_MAX_LENGTH) {
            throw new Error(StoreConfigurationValidationMessage.SignatureLength)
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
                StoreConfigurationValidationMessage.SignatureEmpty
            )
        )
    }

    if (
        formValues.excludedTopics !== null &&
        formValues.excludedTopics.length > 0
    ) {
        const hasEmptyFields = formValues.excludedTopics.some(
            (topic) => topic === ''
        )
        if (hasEmptyFields) {
            throw new Error(
                StoreConfigurationValidationMessage.ExcludedTopicEmpty
            )
        }
        if (formValues.excludedTopics.length > MAX_EXCLUDED_TOPICS) {
            throw new Error(
                StoreConfigurationValidationMessage.ExcludedTopicsLength
            )
        }
        for (const topic of formValues.excludedTopics) {
            if (topic.length > EXCLUDED_TOPIC_MAX_LENGTH) {
                throw new Error(
                    StoreConfigurationValidationMessage.ExcludedTopicLength
                )
            }
        }
    }

    if (formValues.tags !== null && formValues.tags.length > 0) {
        const hasEmptyFields = formValues.tags.some(
            (tag) => tag.name === '' || tag.description === ''
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
                StoreConfigurationValidationMessage.CustomToneOfVoiceEmpty
            )
        )
    }

    if (opts.isMultiChannelEnabled) {
        if (
            isEmailIntegrationMissing(formValues) &&
            formValues.emailChannelDeactivatedDatetime === null
        ) {
            throw new Error(
                StoreConfigurationValidationMessage.EmailIntegrationError
            )
        }

        if (
            opts.isAiAgentChatEnabled &&
            isChatIntegrationMissing(formValues) &&
            formValues.chatChannelDeactivatedDatetime === null
        ) {
            throw new Error(
                StoreConfigurationValidationMessage.ChatIntegrationError
            )
        }
    } else {
        if (opts.isAiAgentChatEnabled) {
            if (
                isChatIntegrationMissing(formValues) &&
                isEmailIntegrationMissing(formValues) &&
                formValues.deactivatedDatetime === null
            ) {
                throw new Error(
                    StoreConfigurationValidationMessage.NoChannelError
                )
            }
        } else {
            if (
                isEmailIntegrationMissing(formValues) &&
                formValues.deactivatedDatetime === null
            ) {
                throw new Error(
                    StoreConfigurationValidationMessage.EmailIntegrationError
                )
            }
        }
    }

    // we must have at least one channel selected in the wizard
    if (
        formValues.wizard &&
        formValues.wizard.enabledChannels &&
        formValues.wizard.enabledChannels.length === 0 &&
        isWizardStepKnowledgeOrCompleted
    ) {
        throw new Error(StoreConfigurationValidationMessage.NoChannelError)
    }

    // we must have integration for selected channel
    if (
        formValues.wizard &&
        formValues.wizard.enabledChannels &&
        formValues.wizard.enabledChannels.includes(AiAgentChannel.Email) &&
        formValues.monitoredEmailIntegrations?.length === 0 &&
        isWizardStepKnowledgeOrCompleted
    ) {
        throw new Error(StoreConfigurationValidationMessage.FieldsMissing)
    }

    if (
        formValues.wizard &&
        formValues.wizard.enabledChannels &&
        formValues.wizard.enabledChannels.includes(AiAgentChannel.Chat) &&
        formValues.monitoredChatIntegrations?.length === 0 &&
        isWizardStepKnowledgeOrCompleted
    ) {
        throw new Error(StoreConfigurationValidationMessage.FieldsMissing)
    }

    if (
        (!formValues.toneOfVoice ||
            formValues.toneOfVoice === ToneOfVoice.Custom) &&
        formValues.customToneOfVoiceGuidance &&
        formValues.customToneOfVoiceGuidance.length >
            CUSTOM_TONE_OF_VOICE_MAX_LENGTH
    ) {
        throw new Error(
            StoreConfigurationValidationMessage.CustomToneOfVoiceLength
        )
    }

    if (
        formValues.helpCenterId === null &&
        (!publicUrls || publicUrls.length === 0) &&
        (!formValues.wizard || formValues.wizard.completedDatetime !== null)
    ) {
        const errorMessage = opts.isOnboardingWizardPage
            ? StoreConfigurationValidationMessage.HelpCenterError
            : StoreConfigurationValidationMessage.HelpCenterEmpty

        throw new Error(errorMessage)
    }

    return {
        ...formValues,
        // Need to explicitly set these fields to non-null
        signature: formValues.signature || '',
        monitoredEmailIntegrations: formValues.monitoredEmailIntegrations || [],
        monitoredChatIntegrations: formValues.monitoredChatIntegrations || [],
    }
}
