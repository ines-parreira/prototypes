import { StatusButton } from '@gorgias/axiom'

type SnoozePreviewProps = {
    value?: string
}

export function SnoozePreview({ value }: SnoozePreviewProps) {
    return (
        <StatusButton color="blue" leadingSlot="timer-snooze">
            {value || 'Snoozed'}
        </StatusButton>
    )
}
