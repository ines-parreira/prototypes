import { LegacyBadge as Badge } from '@gorgias/axiom'

import css from './DraftBadge.less'

export const DraftBadge = () => (
    <Badge type={'light-dark'} className={css.badge}>
        <i className="material-icons">edit</i>
        draft
    </Badge>
)
