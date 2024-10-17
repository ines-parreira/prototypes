import {AiAgentOnboardingWizardStep} from 'models/aiAgent/types'
import {FormValues} from '../types'
import {ToneOfVoice} from '../constants'

export const getStoreConfigurationFormValuesFixture = (
    props?: Partial<FormValues>
): FormValues => ({
    chatChannelDeactivatedDatetime: '2024-06-05T11:27:06.939Z',
    emailChannelDeactivatedDatetime: '2024-06-05T11:27:06.939Z',
    deactivatedDatetime: '2024-06-05T11:27:06.939Z',
    trialModeActivatedDatetime: null,
    ticketSampleRate: null,
    silentHandover: false,
    monitoredEmailIntegrations: [],
    monitoredChatIntegrations: [],
    tags: [],
    excludedTopics: [],
    signature: 'This response was created by AI',
    toneOfVoice: ToneOfVoice.Friendly,
    customToneOfVoiceGuidance:
        "Be concise. Use an empathetic, proactive, and reassuring tone. Acknowledge the customer's feelings with apologies and empathetic expressions. You can include emojis for a personal touch (e.g., 👍) and exclamation points.",
    helpCenterId: 1,
    wizard: {
        completedDatetime: null,
        stepName: AiAgentOnboardingWizardStep.Education,
        hasEducationStepEnabled: true,
        enabledChannels: [],
        isAutoresponderTurnedOff: false,
        onCompletePathway: null,
    },
    ...props,
})
