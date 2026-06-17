import { screen } from '@testing-library/react'

import { render } from '#tests/render.utils'
import {
    VoiceCallTimeline,
    VoiceCallTimelineItem,
} from '#voice-calls/components/TicketThreadCallItem/components/VoiceCallTimeline'

describe('VoiceCallTimeline', () => {
    it('renders children', () => {
        render(
            <VoiceCallTimeline>
                <span>Timeline content</span>
            </VoiceCallTimeline>,
        )

        expect(screen.getByText('Timeline content')).toBeInTheDocument()
    })
})

describe('VoiceCallTimelineItem', () => {
    it('renders children', () => {
        render(
            <VoiceCallTimelineItem>
                <span>Item content</span>
            </VoiceCallTimelineItem>,
        )

        expect(screen.getByText('Item content')).toBeInTheDocument()
    })
})
