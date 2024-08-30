import {
    CreateStoreConfigurationPayload,
    StoreConfiguration,
} from 'models/aiAgent/types'
import {FormValues, ValidFormValues} from '../../types'
import {filterNonNull} from '../../util'
import {ToneOfVoice} from '../../constants'

export const getStoreConfigurationFromFormValues = (
    storeName: string,
    formValues: ValidFormValues
): CreateStoreConfigurationPayload => {
    const {
        helpCenterId,
        deactivatedDatetime,
        trialModeActivatedDatetime,
        monitoredEmailIntegrations,
        ...restOfFormValues
    } = formValues

    const monitoredEmailIntegrationDetails = {
        monitoredEmailIntegrations,
    }

    const dirtyFormValues = filterNonNull(restOfFormValues)

    const signature = formValues.signature

    return {
        storeName,
        ...monitoredEmailIntegrationDetails,
        ...dirtyFormValues,
        deactivatedDatetime: deactivatedDatetime as string | null,
        trialModeActivatedDatetime: trialModeActivatedDatetime,
        customToneOfVoiceGuidance:
            formValues.toneOfVoice === ToneOfVoice.Custom
                ? formValues.customToneOfVoiceGuidance
                : null,
        signature,
        helpCenterId,
        monitoredChatIntegrations: formValues.monitoredChatIntegrations,
    }
}

export const getFormValuesFromStoreConfiguration = (
    storeConfig: StoreConfiguration
): FormValues => ({
    deactivatedDatetime: storeConfig.deactivatedDatetime,
    trialModeActivatedDatetime: storeConfig.trialModeActivatedDatetime,
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
})
