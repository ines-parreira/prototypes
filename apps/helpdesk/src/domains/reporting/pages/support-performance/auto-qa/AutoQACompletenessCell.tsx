import { Badge } from '@gorgias/axiom'

import {
    COMPLETENESS_STATUS_COMPLETE,
    COMPLETENESS_STATUS_INCOMPLETE,
} from 'domains/reporting/pages/support-performance/auto-qa/AutoQAMetricsConfig'

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
