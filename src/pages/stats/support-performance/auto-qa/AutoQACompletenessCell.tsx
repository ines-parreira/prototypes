import React from 'react'

import { Badge } from '@gorgias/merchant-ui-kit'

import {
    COMPLETENESS_STATUS_COMPLETE,
    COMPLETENESS_STATUS_INCOMPLETE,
} from 'pages/stats/support-performance/auto-qa/AutoQAMetricsConfig'

export const AutoQACompletenessCell = ({
    data,
}: {
    data: string | undefined
}) => {
    const badgeType = data === '1' ? 'light-success' : 'light-warning'
    const badgeText =
        data === '1'
            ? COMPLETENESS_STATUS_COMPLETE
            : COMPLETENESS_STATUS_INCOMPLETE
    return (
        <div>
            <Badge type={badgeType}>{badgeText}</Badge>
        </div>
    )
}
