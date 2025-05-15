import {
    AiAgentScope,
    CreateStoreConfigurationPayload,
    StoreConfiguration,
} from 'models/aiAgent/types'
import { isSalesEnabledWithNewActivationXp } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'

import { ToneOfVoice } from '../../constants'
import { ValidFormValues } from '../../types'
import { filterNonNull } from '../../util'

export const getStoreConfigurationFromFormValues = (
    storeName: string,
    formValues: ValidFormValues,
    storeConfiguration: StoreConfiguration | undefined,
    {
        hasNewAutomatePlan,
        isAiSalesBetaUser,
        aiSalesAgentEmailEnabled,
        hasAiAgentNewActivationXp,
    }: {
        hasNewAutomatePlan: boolean
        isAiSalesBetaUser: boolean
        aiSalesAgentEmailEnabled: boolean
        hasAiAgentNewActivationXp: boolean
    },
): CreateStoreConfigurationPayload => {
    const {
        helpCenterId,
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

    const isEmailEnabled = !formValues.emailChannelDeactivatedDatetime
    const isChatEnabled = !formValues.chatChannelDeactivatedDatetime
    let scopes: AiAgentScope[] = []
    if (hasAiAgentNewActivationXp) {
        if (isEmailEnabled || isChatEnabled) {
            scopes.push(AiAgentScope.Support)
        }
        const hasSalesScope = isSalesEnabledWithNewActivationXp({
            isAiSalesBetaUser,
            hasNewAutomatePlan,
            aiSalesAgentEmailEnabled,
            storeHasSales: !!storeConfiguration?.scopes.includes(
                AiAgentScope.Sales,
            ),
            isEmailEnabled,
            isChatEnabled,
        })
        if (hasSalesScope) {
            scopes.push(AiAgentScope.Sales)
        }
    } else {
        scopes = storeConfiguration?.scopes ?? []
    }

    return {
        storeName,
        ...monitoredEmailIntegrationDetails,
        ...dirtyFormValues,
        trialModeActivatedDatetime,
        previewModeActivatedDatetime,
        excludedTopics:
            formValues.excludedTopics ??
            storeConfiguration?.excludedTopics ??
            [],
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
        customFieldIds: formValues.customFieldIds ?? [],
        scopes,
    }
}

export function isPreviewModeActivated({
    isPreviewModeActive,
    isTrialModeAvailable,
    emailChannelDeactivatedDatetime,
    chatChannelDeactivatedDatetime,
    trialModeActivatedDatetime,
    previewModeValidUntilDatetime,
}: {
    isPreviewModeActive: boolean | null | undefined
    isTrialModeAvailable: boolean
    emailChannelDeactivatedDatetime: string | null | undefined
    chatChannelDeactivatedDatetime: string | null | undefined
    trialModeActivatedDatetime: string | null | undefined
    previewModeValidUntilDatetime: string | null | undefined
}): boolean {
    const isAiAgentEnabled =
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
