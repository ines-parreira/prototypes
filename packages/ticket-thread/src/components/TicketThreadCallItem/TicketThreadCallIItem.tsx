import { Box } from '@gorgias/axiom'

import { TicketThreadItemTag } from '../../hooks/types'
import type {
    TicketThreadOutboundVoiceCallItem,
    TicketThreadVoiceCallItem,
} from '../../hooks/voice-calls/types'
import { assertNever } from '../../utils/assertNever'
import { useTicketThreadLegacyBridge } from '../../utils/LegacyBridge'
import { MessageBubble } from '../MessageBubble/MessageBubble'
import { VoiceCallInbound } from './components/VoiceCallInbound'
import { VoiceCallOutbound } from './components/VoiceCallOutbound'
import { VoiceCallSummary } from './components/VoiceCallSummary'

type TicketThreadCallItemProps = {
    item: TicketThreadVoiceCallItem | TicketThreadOutboundVoiceCallItem
}

export function TicketThreadCallItem({ item }: TicketThreadCallItemProps) {
    const { voiceCallCallbacks } = useTicketThreadLegacyBridge()

    const summary = item.data.summaries && item.data.summaries.length > 0 && (
        <MessageBubble variant="internal-note">
            <VoiceCallSummary summaries={item.data.summaries} />
        </MessageBubble>
    )

    switch (item._tag) {
        case TicketThreadItemTag.VoiceCalls.VoiceCall:
            return (
                <Box
                    width="100%"
                    alignItems="flex-start"
                    flexDirection="column"
                    gap="xs"
                >
                    <MessageBubble>
                        <VoiceCallInbound
                            voiceCall={item.data}
                            renderMonitorCallButton={
                                voiceCallCallbacks?.renderMonitorCallButton
                            }
                        />
                    </MessageBubble>
                    {summary}
                </Box>
            )
        case TicketThreadItemTag.VoiceCalls.OutboundVoiceCall:
            return (
                <Box
                    width="100%"
                    alignItems="flex-end"
                    flexDirection="column"
                    gap="xs"
                >
                    <MessageBubble variant="from-agent">
                        <VoiceCallOutbound
                            voiceCall={item.data}
                            renderMonitorCallButton={
                                voiceCallCallbacks?.renderMonitorCallButton
                            }
                        />
                    </MessageBubble>
                    {summary}
                </Box>
            )
        default:
            return assertNever(item)
    }
}
