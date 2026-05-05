import { SidePanel } from '@gorgias/axiom'

import { channelToCommunicationIcon } from 'pages/common/components/infobar/Infobar/TicketTimelineWidget/channelToCommunicationIcon'
import { TimelineContent } from 'tickets/ticket-timeline'

type Props = {
    isOpen: boolean
    onClose: () => void
    shopperId: number
    activeTicketId?: string
}

export function TimelineSidePanel({
    isOpen,
    onClose,
    shopperId,
    activeTicketId,
}: Props) {
    return (
        <SidePanel
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
            placement="right"
            size="md"
            withoutOverlay
            withoutPadding
        >
            {isOpen && (
                <TimelineContent
                    shopperId={shopperId}
                    activeTicketId={activeTicketId}
                    channelToCommunicationIcon={channelToCommunicationIcon}
                    onClose={onClose}
                />
            )}
        </SidePanel>
    )
}
