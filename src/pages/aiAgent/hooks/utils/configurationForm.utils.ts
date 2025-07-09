import {
    AiAgentOnboardingWizardStep,
    StoreConfiguration,
} from 'models/aiAgent/types'

import { FormValues } from '../../types'

export function isAiAgentOnboardingWizardStep(
    value: any,
): value is AiAgentOnboardingWizardStep {
    return Object.values(AiAgentOnboardingWizardStep).includes(value)
}

export const getFormValuesFromStoreConfiguration = (
    storeConfig: StoreConfiguration,
): FormValues => ({
    conversationBot: {
        name: storeConfig.conversationBot?.name,
        id: storeConfig.conversationBot?.id,
        email: storeConfig.conversationBot?.email,
    },
    useEmailIntegrationSignature: storeConfig.useEmailIntegrationSignature,
    chatChannelDeactivatedDatetime: storeConfig.chatChannelDeactivatedDatetime,
    emailChannelDeactivatedDatetime:
        storeConfig.emailChannelDeactivatedDatetime,
    trialModeActivatedDatetime: storeConfig.trialModeActivatedDatetime,
    previewModeActivatedDatetime: storeConfig.previewModeActivatedDatetime,
    previewModeValidUntilDatetime: storeConfig.previewModeValidUntilDatetime,
    silentHandover: storeConfig.silentHandover,
    ticketSampleRate: null, // deprecated
    monitoredEmailIntegrations: storeConfig.monitoredEmailIntegrations,
    tags: storeConfig.tags,
    excludedTopics: storeConfig.excludedTopics,
    signature: storeConfig.signature,
    toneOfVoice: storeConfig.toneOfVoice,
    aiAgentLanguage: storeConfig.aiAgentLanguage,
    customToneOfVoiceGuidance: storeConfig.customToneOfVoiceGuidance,
    helpCenterId: storeConfig.helpCenterId,
    monitoredChatIntegrations: storeConfig.monitoredChatIntegrations,
    wizard: storeConfig.wizard && {
        completedDatetime: storeConfig.wizard.completedDatetime || null,
        stepName: isAiAgentOnboardingWizardStep(storeConfig.wizard.stepName)
            ? storeConfig.wizard.stepName
            : null,
        enabledChannels: storeConfig.wizard.stepData.enabledChannels,
        isAutoresponderTurnedOff:
            storeConfig.wizard.stepData.isAutoresponderTurnedOff,
        onCompletePathway: storeConfig.wizard.stepData.onCompletePathway,
    },
    customFieldIds: storeConfig.customFieldIds,
    handoverMethod: storeConfig.handoverMethod,
    handoverEmail: storeConfig.handoverEmail,
    handoverEmailIntegrationId: storeConfig.handoverEmailIntegrationId,
    handoverHttpIntegrationId: storeConfig.handoverHttpIntegrationId,
})
