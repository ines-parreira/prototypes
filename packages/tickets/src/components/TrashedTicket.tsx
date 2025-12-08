import {
    Color,
    Icon,
    IconName,
    Tag,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

export function TrashedTicket({
    trashedDatetime,
}: {
    trashedDatetime: string | null
}) {
    if (!trashedDatetime) return null
    return (
        <Tooltip placement="bottom">
            <TooltipTrigger>
                <Tag
                    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
                    role="button"
                    color={Color.Red}
                    leadingSlot={<Icon name={IconName.TrashEmpty} size="sm" />}
                >
                    Trash
                </Tag>
            </TooltipTrigger>
            <TooltipContent
                title={`Moved to trash on ${new Date(trashedDatetime).toLocaleString()}`}
            />
        </Tooltip>
    )
}
