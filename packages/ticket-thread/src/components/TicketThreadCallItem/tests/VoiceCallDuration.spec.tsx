import { screen } from '@testing-library/react'

import { mockVoiceCall } from '@gorgias/helpdesk-mocks'
import type { VoiceCall } from '@gorgias/helpdesk-queries'
import { VoiceCallStatus } from '@gorgias/helpdesk-types'

import { render } from '../../../tests/render.utils'
import { VoiceCallDuration } from '../components/VoiceCallDuration'

describe('VoiceCallDuration', () => {
    it('renders "Duration Xm Ys" for a completed call with duration', () => {
        const voiceCall = mockVoiceCall({
            direction: 'inbound',
            status: VoiceCallStatus.Completed,
            duration: 90,
            last_answered_by_agent_id: 1,
        }) as unknown as VoiceCall

        render(<VoiceCallDuration voiceCall={voiceCall} />)

        expect(screen.getByText(/Duration 1m 30s/)).toBeInTheDocument()
    })

    it('renders nothing for a missed inbound call', () => {
        const voiceCall = mockVoiceCall({
            direction: 'inbound',
            status: VoiceCallStatus.Canceled,
            last_answered_by_agent_id: undefined,
            answered_by_external_number: undefined,
        }) as unknown as VoiceCall

        const { container } = render(
            <VoiceCallDuration voiceCall={voiceCall} />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('renders "Connected: MM:SS" for an ongoing call', () => {
        const startedDatetime = new Date(Date.now() - 65 * 1000).toISOString()
        const voiceCall = mockVoiceCall({
            direction: 'inbound',
            status: VoiceCallStatus.Answered,
            started_datetime: startedDatetime,
            last_answered_by_agent_id: 1,
        }) as unknown as VoiceCall

        render(<VoiceCallDuration voiceCall={voiceCall} />)

        expect(screen.getByText(/Connected: \d{2}:\d{2}/)).toBeInTheDocument()
    })
})
