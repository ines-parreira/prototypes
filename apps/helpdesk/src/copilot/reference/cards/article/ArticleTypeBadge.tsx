import { Tag } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

export type ArticleTypeBadgeColor = 'accent' | 'blue'

const TAG_COLOR = { accent: 'purple', blue: 'blue' } as const

type Props = {
    icon: IconName
    label: string
    color: ArticleTypeBadgeColor
}

/** Filled, pill-shaped type badge (lilac "Skill" / blue "Guidance"). */
export function ArticleTypeBadge({ icon, label, color }: Props) {
    return (
        <Tag color={TAG_COLOR[color]} leadingSlot={icon}>
            {label}
        </Tag>
    )
}
