import { action } from '@storybook/addon-actions'
import { Meta, StoryObj } from '@storybook/react'

import { AiAgentScope } from 'models/aiAgent/types'
import { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { ToneOfVoice } from 'pages/aiAgent/constants'

import { AiAgentActivationModal } from './AiAgentActivationModal'

const dummyStoreActivation: StoreActivation = {
    name: 'steve-madden',
    title: 'Steve Madden',
    alerts: [],
    support: {
        enabled: true,
        chat: {
            enabled: true,
        },
        email: {
            enabled: true,
        },
    },
    sales: {
        isDisabled: false,
        enabled: true,
    },
    configuration: {
        storeName: 'steve-madden',
        shopType: 'shopify',
        scopes: [AiAgentScope.Sales, AiAgentScope.Support],
        conversationBot: {
            name: 'AI Agent Name',
            id: 1,
            email: 'bot@gorgias.com',
        },
        emailChannelDeactivatedDatetime: null,
        chatChannelDeactivatedDatetime: null,
        trialModeActivatedDatetime: null,
        previewModeActivatedDatetime: null,
        previewModeValidUntilDatetime: null,
        isPreviewModeActive: false,
        helpCenterId: 1,
        guidanceHelpCenterId: 102,
        snippetHelpCenterId: 103,
        aiAgentLanguage: null,
        toneOfVoice: ToneOfVoice.Friendly,
        customToneOfVoiceGuidance: null,
        useEmailIntegrationSignature: true,
        excludedTopics: [],
        signature: 'This response was created by AI',
        tags: [],
        monitoredEmailIntegrations: [
            {
                id: 11,
                email: 'foo@bar.com',
            },
        ],
        monitoredChatIntegrations: [1, 2, 3],
        dryRun: false,
        isDraft: false,
        silentHandover: false,
        ticketSampleRate: 0.5,
        wizardId: null,
        floatingChatInputConfigurationId: null,
        createdDatetime: '1970-01-01T00:00:00.000Z',
        salesDeactivatedDatetime: null,
        isSalesHelpOnSearchEnabled: null,
        salesDiscountMax: null,
        salesDiscountStrategyLevel: null,
        salesPersuasionLevel: null,
        isConversationStartersEnabled: false,
        customFieldIds: [],
        handoverEmail: null,
        handoverMethod: null,
        handoverEmailIntegrationId: null,
        handoverHttpIntegrationId: null,
    },
}
const dummyStoreActivation2: StoreActivation = {
    ...dummyStoreActivation,
    name: 'betsey-johnson',
    title: 'Betsey Johnson',
    alerts: [],
    support: {
        enabled: true,
        chat: {
            enabled: false,
        },
        email: {
            enabled: false,
        },
    },
    sales: {
        isDisabled: false,
        enabled: true,
    },
    configuration: {
        ...dummyStoreActivation.configuration,
        storeName: 'betsey-johnson',
        scopes: [AiAgentScope.Support],
        chatChannelDeactivatedDatetime: '2025-03-07T12:00:00.000Z',
        monitoredChatIntegrations: [],
    },
}

const meta: Meta<typeof AiAgentActivationModal> = {
    title: 'AI Agent/Activation/ActivationModal',
    component: AiAgentActivationModal,
    args: {
        isOpen: true,
        isFetchLoading: false,
        isSaveLoading: false,
        storeActivations: {
            'steve-madden': dummyStoreActivation,
            'betsey-johnson': dummyStoreActivation2,
        },
        onClose: action('onClose'),
        onSalesChange: action('onSalesChange'),
        onSupportChange: action('onSupportChange'),
        onSupportChatChange: action('onSupportChatChange'),
        onSupportEmailChange: action('onSupportEmailChange'),
        onSaveClick: action('onSaveClick'),
        onLearnMoreClick: action('onLearnMoreClick'),
    },
    decorators: [(Story) => <Story />],
}

export default meta

type Story = StoryObj<typeof AiAgentActivationModal>

export const AiAgentActivationModalDefault: Story = {
    render: (args) => <AiAgentActivationModal {...args} />,
    args: {},
}
