import React, {ComponentProps} from 'react'

import Badge from 'pages/common/components/Badge/Badge'
import {PLAN_NAME_TO_BADGE_COLOR} from 'models/billing/utils'

type Props = {
    planName?: keyof typeof PLAN_NAME_TO_BADGE_COLOR
} & Omit<ComponentProps<typeof Badge>, 'children'>

const CurrentPlanBadge = ({planName, ...props}: Props) => (
    <Badge
        {...(planName ? {type: PLAN_NAME_TO_BADGE_COLOR[planName]} : {})}
        {...props}
    >
        CURRENT PLAN
    </Badge>
)

export default CurrentPlanBadge
