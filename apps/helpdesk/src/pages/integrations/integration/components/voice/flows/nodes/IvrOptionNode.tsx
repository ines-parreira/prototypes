import { useFormContext } from 'react-hook-form'

import { ActionLabel, NodeProps, NodeWrapper } from 'core/ui/flows'

import { type IvrOptionNode, VoiceFlowFormValues } from '../types'

type IvrOptionNodeProps = NodeProps<IvrOptionNode>

export function IvrOptionNode(props: IvrOptionNodeProps) {
    const { data } = props
    const { watch } = useFormContext<VoiceFlowFormValues>()

    const inputDigit = watch(
        `steps.${data.parentId}.branch_options.${data.optionIndex}.input_digit`,
    )

    return (
        <NodeWrapper {...props}>
            <ActionLabel label={inputDigit} />
        </NodeWrapper>
    )
}
