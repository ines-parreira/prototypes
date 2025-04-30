import { render, screen } from '@testing-library/react'
import { mockFlags } from 'jest-launchdarkly-mock'

import '@testing-library/jest-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import { TicketPreview } from 'pages/aiAgent/AiAgentOnboardingWizard/TicketPreview'
import { ToneOfVoice } from 'pages/aiAgent/constants'

describe('TicketPreview', () => {
    const signature = 'Best regards, AI Agent'

    it('renders nothing if toneOfVoice is null', () => {
        const { container } = render(
            <TicketPreview toneOfVoice={null} signature={signature} />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('renders the friendly tone of voice message correctly', () => {
        render(
            <TicketPreview
                toneOfVoice={ToneOfVoice.Friendly}
                signature={signature}
            />,
        )

        expect(screen.getByText('Hey Alex,')).toBeInTheDocument()
        expect(
            screen.getByText(
                "We totally get it—sometimes things just don't work out. You can return your items within 30 days of purchase for a full refund or exchange, as long as they're unused and in their original packaging.",
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Feel free to reach out if you have any questions!',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText(signature)).toBeInTheDocument()
    })

    it('renders the professional tone of voice message correctly', () => {
        render(
            <TicketPreview
                toneOfVoice={ToneOfVoice.Professional}
                signature={signature}
            />,
        )

        expect(screen.getByText('Hi Alex,')).toBeInTheDocument()
        expect(
            screen.getByText(
                'We accept returns within 30 days of purchase for a full refund or exchange, provided the items are unused and in their original packaging.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'If you have any questions or need further assistance, please feel free to reach out.',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText(signature)).toBeInTheDocument()
    })

    it('renders the sophisticated tone of voice message correctly', () => {
        render(
            <TicketPreview
                toneOfVoice={ToneOfVoice.Sophisticated}
                signature={signature}
            />,
        )

        expect(screen.getByText('Dear Alex,')).toBeInTheDocument()
        expect(
            screen.getByText(
                'We are pleased to inform you that we accept returns within 30 days of purchase for a full refund or exchange, contingent upon the items being unused and in their original packaging.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Should you require any further assistance or have additional inquiries, please do not hesitate to reach out.',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText(signature)).toBeInTheDocument()
    })

    it('renders the default message for custom tone of voice and button to generate preview', () => {
        render(
            <TicketPreview
                toneOfVoice={ToneOfVoice.Custom}
                signature={signature}
                customToneOfVoiceGuidance="This is a custom tone of voice guidance"
            />,
        )

        expect(
            screen.getByText(
                "Click 'Generate Preview' to view a response using your custom tone of voice",
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Generate preview')).toBeInTheDocument()
        expect(screen.getByText(signature)).toBeInTheDocument()
    })

    it('renders the preview message for custom tone of voice', () => {
        render(
            <TicketPreview
                toneOfVoice={ToneOfVoice.Custom}
                signature={signature}
                customToneOfVoiceGuidance="This is a custom tone of voice guidance"
                customToneOfVoicePreview={
                    'This is a custom tone of voice preview'
                }
                onGenerateCustomToneOfVoicePreview={() => {}}
            />,
        )

        expect(
            screen.getByText('This is a custom tone of voice preview'),
        ).toBeInTheDocument()
    })

    it('renders the default message for custom tone of voice and disables button', () => {
        render(
            <TicketPreview
                toneOfVoice={ToneOfVoice.Custom}
                signature={signature}
                customToneOfVoiceGuidance=""
                onGenerateCustomToneOfVoicePreview={() => {}}
            />,
        )

        const generatePreviewBtn = screen.getByRole('button', {
            name: 'Generate preview',
        })

        expect(
            screen.getByText(
                "Click 'Generate Preview' to view a response using your custom tone of voice",
            ),
        ).toBeInTheDocument()
        expect(generatePreviewBtn).toBeInTheDocument()
        expect(generatePreviewBtn).toBeAriaDisabled()
    })

    it.each([[false], [true]])(
        'renders the error message for custom tone of voice when the FF of the revamp is %s',
        (isSettingsRevampedEnabled) => {
            mockFlags({
                [FeatureFlagKey.AiAgentSettingsRevamp]:
                    isSettingsRevampedEnabled,
            })

            render(
                <TicketPreview
                    toneOfVoice={ToneOfVoice.Custom}
                    signature={signature}
                    customToneOfVoiceGuidance="This is a custom tone of voice guidance"
                    isError
                    onGenerateCustomToneOfVoicePreview={() => {}}
                />,
            )

            expect(
                screen.getByText(
                    'Preview could not be generated. Make sure instructions are not vague or contradictory and try again.',
                ),
            ).toBeInTheDocument()
        },
    )

    it.each([[false], [true]])(
        'renders the skeleton for for custom tone of voice and disables button when the FF of the revamp is %s',
        (isSettingsRevampedEnabled) => {
            mockFlags({
                [FeatureFlagKey.AiAgentSettingsRevamp]:
                    isSettingsRevampedEnabled,
            })

            render(
                <TicketPreview
                    toneOfVoice={ToneOfVoice.Custom}
                    signature={signature}
                    customToneOfVoiceGuidance="This is a custom tone of voice guidance"
                    isLoadingCustomToneOfVoicePreview
                    onGenerateCustomToneOfVoicePreview={() => {}}
                />,
            )
            const generatePreviewBtn = screen.getByRole('button', {
                name: 'Loading... Generate preview',
            })
            const skeletonElement = document.querySelector(
                '.react-loading-skeleton',
            )
            expect(skeletonElement).toBeInTheDocument()

            expect(generatePreviewBtn).toBeAriaDisabled()
        },
    )
})
