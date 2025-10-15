import { ComponentProps } from 'react'

import { cloneDeep } from 'lodash'

import { useFormContext } from 'core/forms'
import { DEFAULT_CALLBACK_REQUESTS } from 'models/integration/constants'
import PreviewRadioFieldSet from 'pages/common/forms/PreviewRadioFieldSet'

import { VoiceFlowNodeType } from './constants'
import { VoiceFlowFormValues } from './types'
import { useDeleteNode } from './utils/useDeleteNode'

type RouteToStepTypeFieldProps = ComponentProps<typeof PreviewRadioFieldSet> & {
    id: string
}

export const RouteToStepTypeField = ({
    id,
    onChange,
    ...props
}: RouteToStepTypeFieldProps) => {
    const { deleteEnqueueBranches } = useDeleteNode()
    const { setValue, watch, unregister } =
        useFormContext<VoiceFlowFormValues>()
    const step = watch(`steps.${id}`)

    const handleRouteToStepTypeChange = (nextValue: string) => {
        if (nextValue === VoiceFlowNodeType.RouteToInternalNumber) {
            const hasEnqueueBranches =
                'conditional_routing' in step && step.conditional_routing

            if (hasEnqueueBranches) {
                setValue(`steps.${id}.conditional_routing`, false, {
                    shouldDirty: true,
                })
                deleteEnqueueBranches(id)

                /* setTimeout prevents auto-layouting race condition */
                setTimeout(() => {
                    onChange(nextValue)
                }, 0)

                unregister(`steps.${id}.conditional_routing`)
                unregister(`steps.${id}.callback_requests`)
                unregister(`steps.${id}.queue_id`)

                return
            }

            unregister(`steps.${id}.conditional_routing`)
            unregister(`steps.${id}.callback_requests`)
            unregister(`steps.${id}.queue_id`)
        } else if (nextValue === VoiceFlowNodeType.Enqueue) {
            setValue(
                `steps.${id}.callback_requests`,
                cloneDeep(DEFAULT_CALLBACK_REQUESTS),
            )

            unregister(`steps.${id}.integration_id`)
        }

        onChange(nextValue)
    }

    return (
        <PreviewRadioFieldSet
            {...props}
            onChange={(nextValue) => {
                handleRouteToStepTypeChange(nextValue)
            }}
        />
    )
}
