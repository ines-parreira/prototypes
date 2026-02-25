import { renderHook } from '@testing-library/react'

import { useListVoiceCalls } from '@gorgias/helpdesk-queries'

import { TicketThreadItemTag } from '../../types'
import { useTicketThreadVoiceCalls } from '../useTicketThreadVoiceCalls'

vi.mock('@gorgias/helpdesk-queries', () => ({
    useListVoiceCalls: vi.fn(),
}))

const mockUseListVoiceCalls = vi.mocked(useListVoiceCalls)

describe('useTicketThreadVoiceCalls', () => {
    it('maps outbound and regular voice calls to dedicated tags', () => {
        mockUseListVoiceCalls.mockReturnValue({
            data: [
                {
                    id: 11,
                    provider: 'twilio',
                    status: 'completed',
                    direction: 'inbound',
                    phone_number_source: '+1',
                    phone_number_destination: '+2',
                    created_datetime: '2024-03-21T11:00:00Z',
                },
                {
                    id: 12,
                    provider: 'twilio',
                    status: 'completed',
                    direction: 'outbound',
                    phone_number_source: '+1',
                    phone_number_destination: '+2',
                    initiated_by_agent_id: 77,
                    created_datetime: '2024-03-21T11:10:00Z',
                },
            ],
        } as any)

        const { result } = renderHook(() =>
            useTicketThreadVoiceCalls({ ticketId: 7 }),
        )

        // Legacy parity: voice calls remain first-class timeline elements,
        // and outbound calls are still distinguishable for dedicated rendering.
        expect(result.current.map((item) => item._tag)).toEqual([
            TicketThreadItemTag.VoiceCalls.VoiceCall,
            TicketThreadItemTag.VoiceCalls.OutboundVoiceCall,
        ])
    })

    it('returns an empty list when the API has no voice calls', () => {
        mockUseListVoiceCalls.mockReturnValue({ data: [] } as any)

        const { result } = renderHook(() =>
            useTicketThreadVoiceCalls({ ticketId: 99 }),
        )

        expect(result.current).toEqual([])
    })
})
