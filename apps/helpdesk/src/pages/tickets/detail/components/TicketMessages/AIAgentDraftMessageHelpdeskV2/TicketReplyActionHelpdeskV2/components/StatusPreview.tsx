import { StatusButton } from '@gorgias/axiom'
import { startCase } from '@gorgias/toolkit'

type StatusPreviewProps = {
    status?: string
}

export function StatusPreview({ status }: StatusPreviewProps) {
    const normalizedStatus = status?.trim().toLowerCase()

    switch (normalizedStatus) {
        case 'closed':
            return (
                <StatusButton color="grey" leadingSlot="check-circle">
                    Closed
                </StatusButton>
            )
        case 'snoozed':
            return (
                <StatusButton color="blue" leadingSlot="timer-snooze">
                    Snoozed
                </StatusButton>
            )
        default:
            return (
                <StatusButton color="purple" leadingSlot="inbox">
                    {startCase(normalizedStatus ?? '')}
                </StatusButton>
            )
    }
}
