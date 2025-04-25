import { AiAgentOnboardingWizardStep } from 'models/aiAgent/types'

import { ToneOfVoice } from '../constants'
import { FormValues } from '../types'

export const getStoreConfigurationFormValuesFixture = (
    props?: Partial<FormValues>,
): FormValues => ({
    chatChannelDeactivatedDatetime: '2024-06-05T11:27:06.939Z',
    emailChannelDeactivatedDatetime: '2024-06-05T11:27:06.939Z',
    trialModeActivatedDatetime: null,
    previewModeActivatedDatetime: null,
    previewModeValidUntilDatetime: null,
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
        stepName: AiAgentOnboardingWizardStep.Personalize,
        enabledChannels: [],
        isAutoresponderTurnedOff: false,
        onCompletePathway: null,
    },
    customFieldIds: [],
    ...props,
})
