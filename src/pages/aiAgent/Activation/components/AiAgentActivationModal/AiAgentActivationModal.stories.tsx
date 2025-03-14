import React from 'react'

import { action } from '@storybook/addon-actions'
import { Meta, StoryObj } from '@storybook/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Map } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { appQueryClient } from 'api/queryClient'
import { user } from 'fixtures/users'
import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'
import { ToneOfVoice } from 'pages/aiAgent/constants'

import { AiAgentActivationModal } from './AiAgentActivationModal'

const defaultState = {
    currentUser: Map(user),
}

const dummyStoreConfig: StoreConfiguration = {
    storeName: 'steve-madden',
    scopes: [AiAgentScope.Sales, AiAgentScope.Support],
    conversationBot: {
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
    toneOfVoice: ToneOfVoice.Friendly,
    customToneOfVoiceGuidance: null,
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
    createdDatetime: '1970-01-01T00:00:00.000Z',
    salesDiscountMax: null,
    salesDiscountStrategyLevel: null,
    salesPersuasionLevel: null,
}
const dummyStoreConfig2: StoreConfiguration = {
    ...dummyStoreConfig,
    storeName: 'betsey-johnson',
    scopes: [AiAgentScope.Support],
    chatChannelDeactivatedDatetime: '2025-03-07T12:00:00.000Z',
    monitoredChatIntegrations: [],
}

const meta: Meta<typeof AiAgentActivationModal> = {
    title: 'AI Agent/Activation/ActivationModal',
    component: AiAgentActivationModal,
    args: {
        accountDomain: 'domain',
        isOpen: true,
        onClose: action('onClose'),
        storeConfigs: [dummyStoreConfig, dummyStoreConfig2],
    },
    decorators: [
        (Story) => (
            <Provider store={configureMockStore()(defaultState)}>
                <QueryClientProvider client={appQueryClient}>
                    <MemoryRouter initialEntries={['/']}>
                        <Story />
                    </MemoryRouter>
                </QueryClientProvider>
            </Provider>
        ),
    ],
}

export default meta

type Story = StoryObj<typeof AiAgentActivationModal>

export const AiAgentActivationModalDefault: Story = {
    render: (args) => <AiAgentActivationModal {...args} />,
    args: {},
}
