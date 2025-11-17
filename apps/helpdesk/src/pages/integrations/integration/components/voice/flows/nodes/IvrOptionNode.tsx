import { useFormContext } from 'react-hook-form'

import type { NodeProps } from 'core/ui/flows'
import { ActionLabel, NodeWrapper } from 'core/ui/flows'

import type {
    IvrOptionNode as IvrOptionNodeType,
    VoiceFlowFormValues,
} from '../types'

type IvrOptionNodeProps = NodeProps<IvrOptionNodeType>

export function IvrOptionNode(props: IvrOptionNodeProps) {
    const { data } = props
    const { watch } = useFormContext<VoiceFlowFormValues>()

    const inputDigit = watch(
        `steps.${data.parentId}.branch_options.${data.optionIndex}.input_digit`,
    )
    const branchName = watch(
        `steps.${data.parentId}.branch_options.${data.optionIndex}.branch_name`,
    )
    const label = branchName ? `${inputDigit} - ${branchName}` : inputDigit

    return (
        <NodeWrapper {...props}>
            <ActionLabel label={label} />
        </NodeWrapper>
    )
}
