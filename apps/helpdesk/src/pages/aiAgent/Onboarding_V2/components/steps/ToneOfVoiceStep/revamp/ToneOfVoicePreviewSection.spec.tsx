import React from 'react'

import { render } from '@repo/testing'
import { act } from '@testing-library/react'

import { ToneOfVoice } from 'pages/aiAgent/constants'

import { ToneOfVoicePreviewSection } from './ToneOfVoicePreviewSection'

const mockSimulateConversation = jest.fn()
const mockUpdateSettings = jest.fn()
let capturedOnPreviewLoaded: (() => void) | undefined
let provideImperativeHandle = true

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/ChatPreviewPanel',
    () => {
        const React = require('react')

        const ChatPreviewPanel = React.forwardRef(
            (
                props: {
                    appId: string | null
                    withHeader?: boolean
                    supportDefaultChatPreview?: boolean
                    onPreviewLoaded?: () => void
                },
                ref: React.Ref<any>,
            ) => {
                capturedOnPreviewLoaded = props.onPreviewLoaded

                React.useImperativeHandle(ref, () =>
                    provideImperativeHandle
                        ? {
                              simulateConversation: mockSimulateConversation,
                              displayPage: jest.fn(),
                              updatePosition: jest.fn(),
                              updateSettings: mockUpdateSettings,
                              updateTexts: jest.fn(),
                              closeChat: jest.fn(),
                              openChat: jest.fn(),
                              updateWorkflowEntryPoints: jest.fn(),
                              reloadPreview: jest.fn(),
                              updatePreviewOrders: jest.fn(),
                              setConversationMessages: jest.fn(),
                              isLoaded: false,
                          }
                        : null,
                )

                return (
                    <div
                        data-testid="chat-preview-panel"
                        data-with-header={String(props.withHeader)}
                        data-support-default={String(
                            props.supportDefaultChatPreview,
                        )}
                    />
                )
            },
        )

        return { ChatPreviewPanel }
    },
)

jest.mock('pages/aiAgent/Onboarding_V2/constants/conversationExamples', () => ({
    toneOfVoiceConversations: {
        [ToneOfVoice.Friendly]: {
            messages: [
                {
                    content: 'Hello!',
                    isHtml: false,
                    fromAgent: false,
                },
                {
                    content: 'Hi there! How can I help?',
                    isHtml: false,
                    fromAgent: true,
                },
            ],
        },
        [ToneOfVoice.Professional]: {
            messages: [
                {
                    content: 'Hello',
                    isHtml: false,
                    fromAgent: false,
                },
                {
                    content: 'Good day. How may I assist you?',
                    isHtml: false,
                    fromAgent: true,
                },
            ],
        },
    },
}))

describe('ToneOfVoicePreviewSection', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        capturedOnPreviewLoaded = undefined
        provideImperativeHandle = true
    })

    const defaultProps = {
        toneOfVoice: ToneOfVoice.Friendly,
        isCustomToneOfVoicePreviewLoading: false,
    }

    it('renders ChatPreviewPanel with correct props', () => {
        const { getByTestId } = render(
            <ToneOfVoicePreviewSection {...defaultProps} />,
        )

        const panel = getByTestId('chat-preview-panel')
        expect(panel).toHaveAttribute('data-with-header', 'false')
        expect(panel).toHaveAttribute('data-support-default', 'true')
    })

    it('passes appId to ChatPreviewPanel', () => {
        const { getByTestId } = render(
            <ToneOfVoicePreviewSection {...defaultProps} appId="test-app" />,
        )

        expect(getByTestId('chat-preview-panel')).toBeInTheDocument()
    })

    it('passes null appId when not provided', () => {
        const { getByTestId } = render(
            <ToneOfVoicePreviewSection {...defaultProps} />,
        )

        expect(getByTestId('chat-preview-panel')).toBeInTheDocument()
    })

    it('calls simulateConversation with friendly messages on preview loaded', () => {
        render(<ToneOfVoicePreviewSection {...defaultProps} />)

        act(() => {
            capturedOnPreviewLoaded?.()
        })

        expect(mockSimulateConversation).toHaveBeenCalledWith([
            { text: 'Hello!', isHtml: false, fromAgent: false, isBot: false },
            {
                text: 'Hi there! How can I help?',
                isHtml: false,
                fromAgent: true,
                isBot: true,
            },
        ])
    })

    it('applies the Gorgias logo branding on preview loaded', () => {
        render(<ToneOfVoicePreviewSection {...defaultProps} />)

        act(() => {
            capturedOnPreviewLoaded?.()
        })

        expect(mockUpdateSettings).toHaveBeenCalledWith({
            decoration: expect.objectContaining({
                headerPictureUrl: expect.anything(),
                avatarType: 'team-picture',
                avatarTeamPictureUrl: expect.anything(),
                avatar: {
                    imageType: 'company-logo',
                    nameType: 'agent-first-name',
                    companyLogoUrl: expect.anything(),
                },
            }),
        })
    })

    it('applies the Gorgias logo branding even when custom preview is loading', () => {
        render(
            <ToneOfVoicePreviewSection
                {...defaultProps}
                toneOfVoice={ToneOfVoice.Custom}
                isCustomToneOfVoicePreviewLoading={true}
            />,
        )

        act(() => {
            capturedOnPreviewLoaded?.()
        })

        expect(mockUpdateSettings).toHaveBeenCalled()
        expect(mockSimulateConversation).not.toHaveBeenCalled()
    })

    it('does not call simulateConversation when custom preview is loading', () => {
        render(
            <ToneOfVoicePreviewSection
                {...defaultProps}
                toneOfVoice={ToneOfVoice.Custom}
                isCustomToneOfVoicePreviewLoading={true}
            />,
        )

        act(() => {
            capturedOnPreviewLoaded?.()
        })

        expect(mockSimulateConversation).not.toHaveBeenCalled()
    })

    it('uses custom preview messages when tone is Custom and preview is available', () => {
        render(
            <ToneOfVoicePreviewSection
                {...defaultProps}
                toneOfVoice={ToneOfVoice.Custom}
                latestCustomToneOfVoicePreview="<p>Custom response</p>"
            />,
        )

        act(() => {
            capturedOnPreviewLoaded?.()
        })

        expect(mockSimulateConversation).toHaveBeenCalledWith([
            {
                text: "What's your return policy?",
                isHtml: false,
                fromAgent: false,
                isBot: false,
            },
            {
                text: '<p>Custom response</p>',
                isHtml: true,
                fromAgent: true,
                isBot: true,
            },
        ])
    })

    it('calls simulateConversation again when tone changes after initial load', () => {
        const { rerender } = render(
            <ToneOfVoicePreviewSection {...defaultProps} />,
        )

        act(() => {
            capturedOnPreviewLoaded?.()
        })
        mockSimulateConversation.mockClear()

        rerender(
            <ToneOfVoicePreviewSection
                {...defaultProps}
                toneOfVoice={ToneOfVoice.Professional}
            />,
        )

        expect(mockSimulateConversation).toHaveBeenCalledWith([
            { text: 'Hello', isHtml: false, fromAgent: false, isBot: false },
            {
                text: 'Good day. How may I assist you?',
                isHtml: false,
                fromAgent: true,
                isBot: true,
            },
        ])
    })

    it('does not throw and skips branding when the preview panel ref is unavailable', () => {
        provideImperativeHandle = false
        render(<ToneOfVoicePreviewSection {...defaultProps} />)

        act(() => {
            capturedOnPreviewLoaded?.()
        })

        expect(mockUpdateSettings).not.toHaveBeenCalled()
        expect(mockSimulateConversation).not.toHaveBeenCalled()
    })

    it('does not simulate on initial render before preview loaded', () => {
        render(<ToneOfVoicePreviewSection {...defaultProps} />)

        expect(mockSimulateConversation).not.toHaveBeenCalled()
    })
})
