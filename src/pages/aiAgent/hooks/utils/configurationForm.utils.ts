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
    deactivatedDatetime: storeConfig.deactivatedDatetime,
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
    customToneOfVoiceGuidance: storeConfig.customToneOfVoiceGuidance,
    helpCenterId: storeConfig.helpCenterId,
    monitoredChatIntegrations: storeConfig.monitoredChatIntegrations,
    wizard: storeConfig.wizard && {
        completedDatetime: storeConfig.wizard.completedDatetime || null,
        stepName: isAiAgentOnboardingWizardStep(storeConfig.wizard.stepName)
            ? storeConfig.wizard.stepName
            : null,
        hasEducationStepEnabled:
            storeConfig.wizard.stepData.hasEducationStepEnabled,
        enabledChannels: storeConfig.wizard.stepData.enabledChannels,
        isAutoresponderTurnedOff:
            storeConfig.wizard.stepData.isAutoresponderTurnedOff,
        onCompletePathway: storeConfig.wizard.stepData.onCompletePathway,
    },
})
