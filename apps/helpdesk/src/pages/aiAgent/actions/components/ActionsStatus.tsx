import { LegacyBadge as Badge } from '@gorgias/axiom'

import type { LlmTriggeredExecution } from '../types'

const success = <Badge type={'light-success'}>SUCCESS</Badge>
const error = <Badge type={'light-error'}>ERROR</Badge>
const partial_success = <Badge type={'light-warning'}>PARTIAL SUCCESS</Badge>

export default function ActionStatus({
    status,
}: {
    status: LlmTriggeredExecution['status']
}) {
    switch (status) {
        case 'success':
            return success
        case 'partial_success':
            return partial_success
        case 'error':
            return error
        default:
            return <></>
    }
}
