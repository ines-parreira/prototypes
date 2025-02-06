import React from 'react'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

import {LlmTriggeredExecution} from '../types'

const success = <Badge type={ColorType.LightSuccess}>SUCCESS</Badge>
const error = <Badge type={ColorType.LightError}>ERROR</Badge>
const partial_success = (
    <Badge type={ColorType.LightWarning}>PARTIAL SUCCESS</Badge>
)

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
