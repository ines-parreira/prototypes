import { useFormContext } from 'react-hook-form'

import { ActionLabel, NodeProps, NodeWrapper } from 'core/ui/flows'

import { type CustomerLookupOptionNode, VoiceFlowFormValues } from '../types'

type CustomerLookupOptionNodeProps = NodeProps<CustomerLookupOptionNode>

export function CustomerLookupOptionNode(props: CustomerLookupOptionNodeProps) {
    const { data } = props
    const { watch } = useFormContext<VoiceFlowFormValues>()

    const label = watch(
        `steps.${data.parentId}.branch_options.${data.optionIndex}.branch_name`,
    )

    return (
        <NodeWrapper {...props}>
            <ActionLabel
                label={
                    data.isDefaultOption
                        ? 'Other'
                        : label || `${(data.optionIndex ?? 0) + 1}`
                }
            />
        </NodeWrapper>
    )
}
