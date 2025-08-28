import { FeatureFlagKey } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { StoreConfiguration } from 'models/aiAgent/types'
import { ToneOfVoice } from 'pages/aiAgent/constants'

import { ToneOfVoiceFormComponent } from '../ToneOfVoiceFormComponent'

// Mock the useFlags hook
jest.mock('launchdarkly-react-client-sdk', () => ({
    useFlags: jest.fn(),
}))

const mockUpdateValue = jest.fn()

const defaultProps = {
    updateValue: mockUpdateValue,
    toneOfVoice: null,
    customToneOfVoiceGuidance: null,
    storeConfiguration: {
        id: 1,
        name: 'Test Store',
        language: 'en',
        trialModeActivatedDatetime: null,
        previewModeActivatedDatetime: null,
        storeName: 'Test Store',
        shopType: 'shopify',
        helpCenterId: null,
        snippetHelpCenterId: 1,
        guidanceHelpCenterId: 1,
        toneOfVoice: ToneOfVoice.Friendly,
        customToneOfVoiceGuidance: null,
        aiAgentLanguage: null,
        useEmailIntegrationSignature: true,
        signature: '',
        excludedTopics: [],
        tags: [],
        conversationBot: { id: 1, email: 'test@test.com', name: 'Test Bot' },
        monitoredEmailIntegrations: [],
        monitoredChatIntegrations: [],
        silentHandover: false,
        ticketSampleRate: 100,
        dryRun: false,
        isDraft: false,
        wizardId: null,
        floatingChatInputConfigurationId: null,
        chatChannelDeactivatedDatetime: null,
        emailChannelDeactivatedDatetime: null,
        previewModeValidUntilDatetime: null,
        scopes: [],
        createdDatetime: '2024-01-01T00:00:00Z',
        salesDiscountMax: null,
        salesDiscountStrategyLevel: null,
        salesPersuasionLevel: null,
        salesDeactivatedDatetime: null,
        isConversationStartersEnabled: false,
        isSalesHelpOnSearchEnabled: null,
        customFieldIds: [],
        handoverEmail: null,
        handoverMethod: null,
        handoverEmailIntegrationId: null,
        handoverHttpIntegrationId: null,
        monitoredSmsIntegrations: [],
        isSmsChannelEnabled: true,
        smsChannelDeactivatedDatetime: null,
        updateSmsChannelDeactivatedDatetime: jest.fn(),
    } as StoreConfiguration,
    aiAgentMode: 'test',
    aiAgentPreviewTicketViewId: null,
    aiAgentLanguage: null,
}

describe('ToneOfVoiceFormComponent', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('does not display language control when feature flag is false', () => {
        ;(useFlags as jest.Mock).mockReturnValue({
            [FeatureFlagKey.AiAgentCustomLanguage]: false,
        })
        render(<ToneOfVoiceFormComponent {...defaultProps} />)
        expect(screen.queryByText('Language')).not.toBeInTheDocument()
    })

    it('displays language control when feature flag is true', () => {
        ;(useFlags as jest.Mock).mockReturnValue({
            [FeatureFlagKey.AiAgentCustomLanguage]: true,
        })
        render(<ToneOfVoiceFormComponent {...defaultProps} />)
        expect(screen.getByText('Language')).toBeInTheDocument()
    })

    it('passes aiAgentLanguage prop to AiLanguageSettings when feature flag is true', () => {
        ;(useFlags as jest.Mock).mockReturnValue({
            [FeatureFlagKey.AiAgentCustomLanguage]: true,
        })
        const propsWithLanguage = {
            ...defaultProps,
            aiAgentLanguage: 'French',
        }
        render(<ToneOfVoiceFormComponent {...propsWithLanguage} />)
        expect(screen.getByText('Language')).toBeInTheDocument()
    })
})
