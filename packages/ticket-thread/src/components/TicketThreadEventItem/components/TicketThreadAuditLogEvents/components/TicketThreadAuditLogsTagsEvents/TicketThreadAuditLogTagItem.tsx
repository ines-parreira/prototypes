import type { ColorValue } from '@gorgias/axiom'
import { Dot, Skeleton, Tag } from '@gorgias/axiom'
import { useGetTag } from '@gorgias/helpdesk-queries'

export function TicketThreadAuditLogTagItem({ id }: { id: string | number }) {
    const { data: tagData } = useGetTag(Number(id))

    if (!tagData?.data) {
        return <Skeleton height="16px" width="40px" />
    }

    return (
        <Tag
            size="sm"
            key={tagData.data.id}
            {...(tagData.data?.decoration?.color && {
                leadingSlot: (
                    <Dot
                        color={tagData.data?.decoration?.color as ColorValue}
                    />
                ),
            })}
        >
            {tagData.data?.name}
        </Tag>
    )
}
