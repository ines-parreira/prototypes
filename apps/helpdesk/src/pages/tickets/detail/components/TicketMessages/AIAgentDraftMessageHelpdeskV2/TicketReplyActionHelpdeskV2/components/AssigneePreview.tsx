import { Avatar, Icon, StatusButton } from '@gorgias/axiom'

type AssigneePreviewProps = {
    name?: string
    profilePictureUrl?: string | null
}

export function AssigneePreview({
    name,
    profilePictureUrl,
}: AssigneePreviewProps) {
    const label = name || 'Unassigned'

    return (
        <StatusButton
            leadingSlot={
                name ? (
                    <Avatar
                        name={label}
                        url={profilePictureUrl ?? undefined}
                        size="sm"
                    />
                ) : (
                    <Icon name="user" size="sm" />
                )
            }
        >
            {label}
        </StatusButton>
    )
}
