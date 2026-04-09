import _startCase from 'lodash/startCase'

import { StatusButton } from '@gorgias/axiom'

type StatusPreviewProps = {
    status?: string
}

export function StatusPreview({ status }: StatusPreviewProps) {
    const normalizedStatus = status?.trim().toLowerCase()

    switch (normalizedStatus) {
        case 'closed':
            return (
                <StatusButton color="grey" leadingSlot="circle-check">
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
                    {_startCase(normalizedStatus ?? '')}
                </StatusButton>
            )
    }
}
