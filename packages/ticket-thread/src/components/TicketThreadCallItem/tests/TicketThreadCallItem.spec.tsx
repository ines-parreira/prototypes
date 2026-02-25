import { render, screen } from '@testing-library/react'

import { TicketThreadItemTag } from '../../../hooks/types'
import type {
    TicketThreadOutboundVoiceCallItem,
    TicketThreadVoiceCallItem,
} from '../../../hooks/voice-calls/types'
import { TicketThreadCallItem } from '../TicketThreadCallIItem'

const voiceCallData = { id: 1, status: 'completed' }

function renderItem(
    item: TicketThreadVoiceCallItem | TicketThreadOutboundVoiceCallItem,
) {
    return render(<TicketThreadCallItem item={item} />)
}

describe('TicketThreadCallItem', () => {
    it('renders a voice call item', () => {
        renderItem({
            _tag: TicketThreadItemTag.VoiceCalls.VoiceCall,
            data: voiceCallData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadVoiceCallItem)

        expect(
            screen.getByText(JSON.stringify(voiceCallData)),
        ).toBeInTheDocument()
    })

    it('renders an outbound voice call item', () => {
        renderItem({
            _tag: TicketThreadItemTag.VoiceCalls.OutboundVoiceCall,
            data: voiceCallData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadOutboundVoiceCallItem)

        expect(
            screen.getByText(JSON.stringify(voiceCallData)),
        ).toBeInTheDocument()
    })
})
