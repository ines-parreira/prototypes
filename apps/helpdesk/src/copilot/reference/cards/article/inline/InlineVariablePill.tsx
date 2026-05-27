import { Tag } from '@gorgias/axiom'

import { pickCategoryIconName } from 'pages/common/draftjs/plugins/guidance-variables/utils'

import css from './InlinePills.less'

type Props = {
    category: string
    label: string
}

export function InlineVariablePill({ category, label }: Props) {
    return (
        <Tag
            color="grey"
            size="sm"
            leadingSlot={pickCategoryIconName(category)}
            overflow="ellipsis"
            className={css.pill}
        >
            {label}
        </Tag>
    )
}
