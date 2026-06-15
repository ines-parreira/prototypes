import type { ColorValue } from '@gorgias/axiom'
import { Dot, Tag } from '@gorgias/axiom'
import { useListTicketTags } from '@gorgias/helpdesk-queries'

function isHexColor(value: string): value is `#${string}` {
    return value.startsWith('#')
}

export function AppliedTag({
    name,
    ticketId,
}: {
    name: string
    ticketId?: number
}) {
    const { data: ticketTags } = useListTicketTags(ticketId ?? 0, {
        query: {
            enabled: !!ticketId,
            select: (response) => response?.data.data ?? [],
        },
    })
    const color = ticketTags?.find((t) => t.name === name)?.decoration?.color
    const dotColor = color && isHexColor(color) ? color : undefined

    return (
        <Tag
            {...(dotColor
                ? { leadingSlot: <Dot color={dotColor as ColorValue} /> }
                : {})}
        >
            {name}
        </Tag>
    )
}
