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
                <>
                    <MessageBubble>
                        <VoiceCallInbound
                            voiceCall={item.data}
                            renderMonitorCallButton={
                                voiceCallCallbacks?.renderMonitorCallButton
                            }
                        />
                    </MessageBubble>
                    {summary}
                </>
            )
        case TicketThreadItemTag.VoiceCalls.OutboundVoiceCall:
            return (
                <>
                    <MessageBubble>
                        <VoiceCallOutbound
                            voiceCall={item.data}
                            renderMonitorCallButton={
                                voiceCallCallbacks?.renderMonitorCallButton
                            }
                        />
                    </MessageBubble>
                    {summary}
                </>
            )
        default:
            return assertNever(item)
    }
}
