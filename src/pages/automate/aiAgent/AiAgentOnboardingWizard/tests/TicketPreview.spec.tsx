import {render, screen} from '@testing-library/react'
import React from 'react'

import '@testing-library/jest-dom'
import {ToneOfVoice} from '../../constants'
import {TicketPreview} from '../TicketPreview'

describe('TicketPreview', () => {
    const signature = 'Best regards, AI Agent'

    it('renders nothing if toneOfVoice is null', () => {
        const {container} = render(
            <TicketPreview toneOfVoice={null} signature={signature} />
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('renders the friendly tone of voice message correctly', () => {
        render(
            <TicketPreview
                toneOfVoice={ToneOfVoice.Friendly}
                signature={signature}
            />
        )

        expect(screen.getByText('Hey Alex,')).toBeInTheDocument()
        expect(
            screen.getByText(
                "We totally get it—sometimes things just don't work out. You can return your items within 30 days of purchase for a full refund or exchange, as long as they're unused and in their original packaging."
            )
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Feel free to reach out if you have any questions!'
            )
        ).toBeInTheDocument()
        expect(screen.getByText(signature)).toBeInTheDocument()
    })

    it('renders the professional tone of voice message correctly', () => {
        render(
            <TicketPreview
                toneOfVoice={ToneOfVoice.Professional}
                signature={signature}
            />
        )

        expect(screen.getByText('Hi Alex,')).toBeInTheDocument()
        expect(
            screen.getByText(
                'We accept returns within 30 days of purchase for a full refund or exchange, provided the items are unused and in their original packaging.'
            )
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'If you have any questions or need further assistance, please feel free to reach out.'
            )
        ).toBeInTheDocument()
        expect(screen.getByText(signature)).toBeInTheDocument()
    })

    it('renders the sophisticated tone of voice message correctly', () => {
        render(
            <TicketPreview
                toneOfVoice={ToneOfVoice.Sophisticated}
                signature={signature}
            />
        )

        expect(screen.getByText('Dear Alex,')).toBeInTheDocument()
        expect(
            screen.getByText(
                'We are pleased to inform you that we accept returns within 30 days of purchase for a full refund or exchange, contingent upon the items being unused and in their original packaging.'
            )
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Should you require any further assistance or have additional inquiries, please do not hesitate to reach out.'
            )
        ).toBeInTheDocument()
        expect(screen.getByText(signature)).toBeInTheDocument()
    })

    it('renders the custom tone of voice message correctly', () => {
        render(
            <TicketPreview
                toneOfVoice={ToneOfVoice.Custom}
                signature={signature}
                customToneOfVoiceGuidance="This is a custom tone of voice guidance"
            />
        )

        expect(
            screen.getByText(
                '[Preview for custom tone of voice is not available yet, but coming soon!]'
            )
        ).toBeInTheDocument()
        expect(screen.getByText(signature)).toBeInTheDocument()
    })
})
