import React from 'react'

import Badge from 'pages/common/components/Badge/Badge'
import {PLAN_NAME_TO_BADGE_COLOR} from 'models/billing/utils'

type Props = {
    planName: keyof typeof PLAN_NAME_TO_BADGE_COLOR
}

const CurrentPlanBadge = ({planName}: Props) => (
    <Badge type={PLAN_NAME_TO_BADGE_COLOR[planName]}>CURRENT PLAN</Badge>
)

export default CurrentPlanBadge
