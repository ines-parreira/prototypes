import { Badge } from '@gorgias/merchant-ui-kit'

import { LlmTriggeredExecution } from '../types'

const success = <Badge type={'light-success'}>SUCCESS</Badge>
const error = <Badge type={'light-error'}>ERROR</Badge>
const partial_success = <Badge type={'light-warning'}>PARTIAL SUCCESS</Badge>

export default function ActionStatus({
    status,
    successFlag,
}: {
    status: LlmTriggeredExecution['status']
    successFlag?: boolean | null
}) {
    if (!status) {
        switch (successFlag) {
            case true:
                return success
            case false:
                return error
            default:
                return <></>
        }
    } else {
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
}
