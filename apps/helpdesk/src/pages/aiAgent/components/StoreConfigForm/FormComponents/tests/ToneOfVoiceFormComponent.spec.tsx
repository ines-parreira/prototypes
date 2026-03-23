import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { StoreConfiguration } from 'models/aiAgent/types'
import { ToneOfVoice } from 'pages/aiAgent/constants'

import { ToneOfVoiceFormComponent } from '../ToneOfVoiceFormComponent'

const mockUpdateValue = jest.fn()

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const mockUseFlag = jest.mocked(useFlag)

const defaultProps = {
    updateValue: mockUpdateValue,
    toneOfVoice: null,
    customToneOfVoiceGuidance: null,
    storeConfiguration: {
        id: 1,
        name: 'Test Store',
        language: 'en',
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
        isConversationStartersDesktopOnly: false,
        embeddedSpqEnabled: false,
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
        mockUseFlag.mockReturnValue(false)
    })

    it('does not display language control when feature flag is false', () => {
        render(<ToneOfVoiceFormComponent {...defaultProps} />)
        expect(screen.queryByText('Language')).not.toBeInTheDocument()
    })

    it('displays language control when feature flag is true', () => {
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiAgentCustomLanguage || false,
        )
        render(<ToneOfVoiceFormComponent {...defaultProps} />)
        expect(screen.getByText('Language')).toBeInTheDocument()
    })

    it('passes aiAgentLanguage prop to AiLanguageSettings when feature flag is true', () => {
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiAgentCustomLanguage || false,
        )
        const propsWithLanguage = {
            ...defaultProps,
            aiAgentLanguage: 'French',
        }
        render(<ToneOfVoiceFormComponent {...propsWithLanguage} />)
        expect(screen.getByText('Language')).toBeInTheDocument()
    })

    describe('Custom Tone of Voice', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(false)
        })

        it('displays custom tone of voice textarea when custom tone is selected', async () => {
            const propsWithCustomTone = {
                ...defaultProps,
                toneOfVoice: ToneOfVoice.Custom,
            }
            render(<ToneOfVoiceFormComponent {...propsWithCustomTone} />)

            expect(
                screen.getByLabelText('Customize Tone of Voice'),
            ).toBeInTheDocument()
        })

        it('displays custom tone of voice guidance value in textarea', () => {
            const customGuidance = 'Custom tone guidance text'
            const propsWithCustomTone = {
                ...defaultProps,
                toneOfVoice: ToneOfVoice.Custom,
                customToneOfVoiceGuidance: customGuidance,
            }
            render(<ToneOfVoiceFormComponent {...propsWithCustomTone} />)

            const textarea = screen.getByLabelText('Customize Tone of Voice')
            expect(textarea).toHaveValue(customGuidance)
        })

        it('calls updateValue when custom tone textarea content changes', async () => {
            const user = userEvent.setup()
            const propsWithCustomTone = {
                ...defaultProps,
                toneOfVoice: ToneOfVoice.Custom,
                customToneOfVoiceGuidance: '',
            }
            render(<ToneOfVoiceFormComponent {...propsWithCustomTone} />)

            const textarea = screen.getByLabelText('Customize Tone of Voice')
            await user.clear(textarea)
            await user.type(textarea, 'X')

            expect(mockUpdateValue).toHaveBeenCalledWith(
                'customToneOfVoiceGuidance',
                'X',
            )
        })

        it('displays validation error when custom tone textarea is empty after blur', async () => {
            const user = userEvent.setup()
            const propsWithCustomTone = {
                ...defaultProps,
                toneOfVoice: ToneOfVoice.Custom,
                customToneOfVoiceGuidance: '',
            }
            render(<ToneOfVoiceFormComponent {...propsWithCustomTone} />)

            const textarea = screen.getByLabelText('Customize Tone of Voice')
            await user.click(textarea)
            await user.tab()

            await waitFor(() => {
                expect(
                    screen.getByText('Tone of voice required.'),
                ).toBeInTheDocument()
            })
        })

        it('displays footer message when custom tone is valid', () => {
            const propsWithCustomTone = {
                ...defaultProps,
                toneOfVoice: ToneOfVoice.Custom,
                customToneOfVoiceGuidance: 'Valid custom tone',
            }
            render(<ToneOfVoiceFormComponent {...propsWithCustomTone} />)

            expect(
                screen.getByText(
                    'Give your AI Agent specific instructions to always follow to match your brand.',
                ),
            ).toBeInTheDocument()
        })

        it('triggers blur handler when custom tone textarea loses focus', async () => {
            const user = userEvent.setup()
            const propsWithCustomTone = {
                ...defaultProps,
                toneOfVoice: ToneOfVoice.Custom,
                customToneOfVoiceGuidance: 'Some guidance',
            }
            render(<ToneOfVoiceFormComponent {...propsWithCustomTone} />)

            const textarea = screen.getByLabelText('Customize Tone of Voice')
            await user.click(textarea)
            await user.tab()

            expect(textarea).not.toHaveFocus()
        })
    })
})
