import { useMemo } from 'react'

import type { VoiceCall } from '@gorgias/helpdesk-queries'
import { useListVoiceCalls } from '@gorgias/helpdesk-queries'

import { getQueryOptions } from '../shared/queryOption'
import { TicketThreadItemTag } from '../types'
import { isOutboundVoiceCall } from './predicates'
import type {
    TicketThreadOutboundVoiceCallItem,
    TicketThreadVoiceCallItem,
} from './types'

type UseTicketThreadVoiceCallsParams = {
    ticketId: number
}

export function useTicketThreadVoiceCalls({
    ticketId,
}: UseTicketThreadVoiceCallsParams): (
    | TicketThreadVoiceCallItem
    | TicketThreadOutboundVoiceCallItem
)[] {
    const { data: voiceCalls } = useListVoiceCalls(
        { ticket_id: ticketId },
        {
            query: {
                ...getQueryOptions(ticketId),
                select: (data): VoiceCall[] => data?.data?.data ?? [],
            },
        },
    )

    return useMemo(
        () =>
            (voiceCalls ?? []).map(
                (
                    voiceCall,
                ):
                    | TicketThreadVoiceCallItem
                    | TicketThreadOutboundVoiceCallItem => {
                    if (isOutboundVoiceCall(voiceCall)) {
                        return {
                            _tag: TicketThreadItemTag.VoiceCalls
                                .OutboundVoiceCall,
                            data: voiceCall,
                            datetime: voiceCall.created_datetime,
                        }
                    }

                    return {
                        _tag: TicketThreadItemTag.VoiceCalls.VoiceCall,
                        data: voiceCall,
                        datetime: voiceCall.created_datetime,
                    }
                },
            ),
        [voiceCalls],
    )
}
