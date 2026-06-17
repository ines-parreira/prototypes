import { Box } from '@gorgias/axiom'

import { useTicketThreadLegacyBridge } from '#legacy-bridge'
import { assertNever } from '#shared/assertNever'
import { TicketThreadItemTag } from '#thread/itemTags'
import { MessageBubble } from '#ticket-messages/components/MessageBubble/MessageBubble'
import type {
    TicketThreadOutboundVoiceCallItem,
    TicketThreadVoiceCallItem,
} from '#voice-calls/types'
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
                    paddingBottom="xxxs"
                    paddingTop="xxxs"
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
                    paddingBottom="xxxs"
                    paddingTop="xxxs"
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
