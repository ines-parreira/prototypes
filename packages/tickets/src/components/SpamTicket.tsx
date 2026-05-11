import { Color, Icon, Tag } from '@gorgias/axiom'

export function SpamTicket() {
    return (
        <Tag
            color={Color.Orange}
            leadingSlot={<Icon name="nav-flag" size="sm" />}
        >
            Spam
        </Tag>
    )
}
