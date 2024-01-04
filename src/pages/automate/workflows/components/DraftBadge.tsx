import React from 'react'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import css from './DraftBadge.less'

export const DraftBadge = () => (
    <Badge type={ColorType.Black} className={css.badge}>
        <i className="material-icons">edit</i>
        draft
    </Badge>
)
