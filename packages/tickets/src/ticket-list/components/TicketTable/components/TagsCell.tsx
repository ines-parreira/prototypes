import {
    DataTableBaseCell,
    OverflowList,
    OverflowListItem,
    OverflowListShowMore,
    Tag,
} from '@gorgias/axiom'
import type { TicketCompact } from '@gorgias/helpdesk-types'

type Props = {
    ticket: TicketCompact
}

export function TagsCell({ ticket }: Props) {
    if (!ticket.tags?.length) {
        return <DataTableBaseCell>{null}</DataTableBaseCell>
    }

    return (
        <DataTableBaseCell>
            <OverflowList gap="xxxs" nonExpandedLineCount={1}>
                {ticket.tags.map((tag) => (
                    <OverflowListItem key={tag.id}>
                        <Tag>{tag.name}</Tag>
                    </OverflowListItem>
                ))}
                <OverflowListShowMore>
                    {({ hiddenCount }) => <Tag>+{hiddenCount}</Tag>}
                </OverflowListShowMore>
            </OverflowList>
        </DataTableBaseCell>
    )
}
