import { Icon, StatusButton } from '@gorgias/axiom'

type TeamAssigneePreviewProps = {
    name?: string
}

export function TeamAssigneePreview({ name }: TeamAssigneePreviewProps) {
    return (
        <StatusButton leadingSlot={<Icon name="users" size="sm" />}>
            {name || 'No team'}
        </StatusButton>
    )
}
