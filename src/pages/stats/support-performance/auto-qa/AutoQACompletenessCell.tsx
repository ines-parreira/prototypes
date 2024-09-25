import React from 'react'
import {
    COMPLETENESS_STATUS_COMPLETE,
    COMPLETENESS_STATUS_INCOMPLETE,
} from 'pages/stats/support-performance/auto-qa/AutoQAMetricsConfig'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

export const AutoQACompletenessCell = ({data}: {data: string | undefined}) => {
    const badgeType =
        data === '1' ? ColorType.LightSuccess : ColorType.LightWarning
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
