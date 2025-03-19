import { Badge } from '@gorgias/merchant-ui-kit'

import css from './DraftBadge.less'

export const DraftBadge = () => (
    <Badge type={'light-dark'} className={css.badge}>
        <i className="material-icons">edit</i>
        draft
    </Badge>
)
