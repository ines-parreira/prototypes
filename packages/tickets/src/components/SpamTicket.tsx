import { Color, Icon, IconName, Tag } from '@gorgias/axiom'

export function SpamTicket() {
    return (
        <Tag
            color={Color.Orange}
            leadingSlot={<Icon name={IconName.NavFlag} size="sm" />}
        >
            Spam
        </Tag>
    )
}
