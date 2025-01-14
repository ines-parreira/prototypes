import {CreateStoreConfigurationPayload} from 'models/aiAgent/types'

import {ToneOfVoice} from '../../constants'
import {ValidFormValues} from '../../types'
import {filterNonNull} from '../../util'

export const getStoreConfigurationFromFormValues = (
    storeName: string,
    formValues: ValidFormValues
): CreateStoreConfigurationPayload => {
    const {
        helpCenterId,
        deactivatedDatetime,
        trialModeActivatedDatetime,
        previewModeActivatedDatetime,
        monitoredEmailIntegrations,
        ...restOfFormValues
    } = formValues

    const monitoredEmailIntegrationDetails = {
        monitoredEmailIntegrations,
    }

    const dirtyFormValues = filterNonNull(restOfFormValues)

    const signature = formValues.signature

    const wizardStepData = {
        hasEducationStepEnabled:
            formValues.wizard?.hasEducationStepEnabled ?? null,
        enabledChannels: formValues.wizard?.enabledChannels ?? null,
        isAutoresponderTurnedOff:
            formValues.wizard?.isAutoresponderTurnedOff ?? null,
        onCompletePathway: formValues.wizard?.onCompletePathway ?? null,
    }

    const wizard = {
        stepName: formValues.wizard?.stepName ?? null,
        stepData: wizardStepData,
        completedDatetime: formValues.wizard?.completedDatetime,
    }

    return {
        storeName,
        ...monitoredEmailIntegrationDetails,
        ...dirtyFormValues,
        deactivatedDatetime: deactivatedDatetime as string | null,
        trialModeActivatedDatetime,
        previewModeActivatedDatetime,
        previewModeValidUntilDatetime:
            formValues.previewModeValidUntilDatetime ?? null,
        chatChannelDeactivatedDatetime:
            formValues.chatChannelDeactivatedDatetime ?? null,
        emailChannelDeactivatedDatetime:
            formValues.emailChannelDeactivatedDatetime ?? null,
        customToneOfVoiceGuidance:
            formValues.toneOfVoice === ToneOfVoice.Custom
                ? formValues.customToneOfVoiceGuidance
                : null,
        signature,
        helpCenterId,
        monitoredChatIntegrations: formValues.monitoredChatIntegrations,
        wizard: formValues.wizard ? wizard : undefined,
    }
}

export function isPreviewModeActivated({
    isPreviewModeActive,
    isTrialModeAvailable,
    deactivatedDatetime,
    emailChannelDeactivatedDatetime,
    chatChannelDeactivatedDatetime,
    trialModeActivatedDatetime,
    previewModeValidUntilDatetime,
}: {
    isPreviewModeActive: boolean | null | undefined
    isTrialModeAvailable: boolean
    deactivatedDatetime: string | null | undefined
    emailChannelDeactivatedDatetime: string | null | undefined
    chatChannelDeactivatedDatetime: string | null | undefined
    trialModeActivatedDatetime: string | null | undefined
    previewModeValidUntilDatetime: string | null | undefined
}): boolean {
    const isAiAgentEnabled =
        deactivatedDatetime === null ||
        emailChannelDeactivatedDatetime === null ||
        chatChannelDeactivatedDatetime === null

    if (isAiAgentEnabled) {
        return false
    }

    if (previewModeValidUntilDatetime) {
        return !!isPreviewModeActive
    }

    if (isTrialModeAvailable) {
        return !!trialModeActivatedDatetime
    }

    return false
}
