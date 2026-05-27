import { Tag } from '@gorgias/axiom'

import css from './InlinePills.less'

type Props = {
    label: string
}

export function InlineActionPill({ label }: Props) {
    return (
        <Tag color="grey" size="sm" overflow="ellipsis" className={css.pill}>
            <span className={css.actionPrefix}>Use action:</span>
            <span className={css.pillLabel}>{label}</span>
        </Tag>
    )
}
