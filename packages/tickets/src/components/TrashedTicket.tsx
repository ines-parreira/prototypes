import {
    Color,
    Icon,
    IconName,
    Tag,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import css from './TrashedTicket.less'

export function TrashedTicket({
    trashedDatetime,
}: {
    trashedDatetime: string | null
}) {
    if (!trashedDatetime) return null
    return (
        <Tooltip
            placement="bottom"
            trigger={
                <Tag
                    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
                    role="button"
                    color={Color.Red}
                    leadingSlot={<Icon name={IconName.TrashEmpty} size="sm" />}
                    className={css.trashedTicket}
                >
                    Trash
                </Tag>
            }
        >
            <TooltipContent
                title={`Moved to trash on ${new Date(trashedDatetime).toLocaleString()}`}
            />
        </Tooltip>
    )
}
