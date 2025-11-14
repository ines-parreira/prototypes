import { AiAgentOnboardingWizardStep } from 'models/aiAgent/types'

import { ToneOfVoice } from '../constants'
import { FormValues } from '../types'

export const getStoreConfigurationFormValuesFixture = (
    props?: Partial<FormValues>,
): FormValues => ({
    chatChannelDeactivatedDatetime: '2024-06-05T11:27:06.939Z',
    emailChannelDeactivatedDatetime: '2024-06-05T11:27:06.939Z',
    smsChannelDeactivatedDatetime: '2024-06-05T11:27:06.939Z',
    trialModeActivatedDatetime: null,
    previewModeActivatedDatetime: null,
    previewModeValidUntilDatetime: null,
    ticketSampleRate: null,
    silentHandover: false,
    monitoredEmailIntegrations: [],
    monitoredChatIntegrations: [],
    monitoredSmsIntegrations: [],
    tags: [],
    excludedTopics: [],
    signature: 'This response was created by AI',
    smsDisclaimer: 'Powered by AI',
    useEmailIntegrationSignature: true,
    conversationBot: {
        name: 'AI Agent Name',
        id: 1,
        email: 'bot@gorgias.com',
    },
    toneOfVoice: ToneOfVoice.Friendly,
    aiAgentLanguage: null,
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
    handoverEmail: null,
    handoverMethod: null,
    handoverEmailIntegrationId: null,
    handoverHttpIntegrationId: null,
    ...props,
})

export const getOnboardingWizardFormValuesFixture = (
    props?: Partial<FormValues>,
): FormValues => ({
    chatChannelDeactivatedDatetime: '2024-06-05T11:27:06.939Z',
    emailChannelDeactivatedDatetime: null,
    smsChannelDeactivatedDatetime: null,
    trialModeActivatedDatetime: '2024-06-05T11:27:06.939Z',
    previewModeActivatedDatetime: null,
    previewModeValidUntilDatetime: null,
    silentHandover: false,
    monitoredEmailIntegrations: [
        {
            id: 1,
            email: 'test@gorgias.com',
        },
    ],
    tags: [
        {
            name: 'my-awesome-tag',
            description: 'my tag description',
        },
    ],
    excludedTopics: ['returns', 'refund'],
    signature: 'Thank you!\nNice ecommerce team',
    smsDisclaimer: 'Powered by AI',
    toneOfVoice: ToneOfVoice.Friendly,
    conversationBot: {
        name: 'AI Agent Name',
        id: 1,
        email: '',
    },
    useEmailIntegrationSignature: true,
    aiAgentLanguage: null,
    customToneOfVoiceGuidance:
        'The only brand response with exclamation points.',
    helpCenterId: 1,
    ticketSampleRate: null,
    monitoredChatIntegrations: [],
    monitoredSmsIntegrations: [],
    wizard: undefined,
    customFieldIds: null,
    handoverEmail: null,
    handoverMethod: null,
    handoverEmailIntegrationId: null,
    handoverHttpIntegrationId: null,
    ...props,
})
