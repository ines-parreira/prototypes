import { Tag } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

type Props = {
    icon: IconName
    label: string
}

/** Filled, pill-shaped type badge for knowledge reference cards. */
export function ArticleTypeBadge({ icon, label }: Props) {
    return (
        <Tag color="purple" leadingSlot={icon}>
            {label}
        </Tag>
    )
}
