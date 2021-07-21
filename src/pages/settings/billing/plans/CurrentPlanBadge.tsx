import React from 'react'
import {Badge} from 'reactstrap'

import css from './CurrentPlanBadge.less'

const PLAN_NAME_TO_BADGE_COLOR: Partial<Record<string, string>> = {
    Basic: 'primary',
    Pro: 'info',
    Advanced: 'success',
    Custom: 'warning',
    Enterprise: 'warning',
}

type Props = {
    planName: keyof typeof PLAN_NAME_TO_BADGE_COLOR
}

const CurrentPlanBadge = ({planName}: Props) => (
    <Badge
        className={css.currentPlanBadge}
        color={PLAN_NAME_TO_BADGE_COLOR[planName]}
    >
        CURRENT PLAN
    </Badge>
)

export default CurrentPlanBadge
