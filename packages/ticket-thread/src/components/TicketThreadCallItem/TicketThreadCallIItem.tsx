import { Box } from '@gorgias/axiom'

import { TicketThreadItemTag } from '../../hooks/types'
import type {
    TicketThreadOutboundVoiceCallItem,
    TicketThreadVoiceCallItem,
} from '../../hooks/voice-calls/types'
import { assertNever } from '../../utils/assertNever'

type TicketThreadCallItemProps = {
    item: TicketThreadVoiceCallItem | TicketThreadOutboundVoiceCallItem
}

export function TicketThreadCallItem({ item }: TicketThreadCallItemProps) {
    switch (item._tag) {
        case TicketThreadItemTag.VoiceCalls.VoiceCall:
            return <Box padding="md">{JSON.stringify(item.data)}</Box>
        case TicketThreadItemTag.VoiceCalls.OutboundVoiceCall:
            return <Box padding="md">{JSON.stringify(item.data)}</Box>
        default:
            return assertNever(item)
    }
}
