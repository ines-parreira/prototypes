import { useNodesData } from '@xyflow/react'

import { ActionLabel, NodeProps, NodeWrapper } from 'core/ui/flows'

import { IvrMenuNode, type IvrOptionNode } from '../types'

type IvrOptionNodeProps = NodeProps<IvrOptionNode>

export function IvrOptionNode(props: IvrOptionNodeProps) {
    const { data } = props
    const parentStep = useNodesData<IvrMenuNode>(props.data.parentId)

    return (
        <NodeWrapper {...props}>
            <ActionLabel
                label={
                    parentStep?.data.branch_options[data.optionIndex]
                        .input_digit ?? ''
                }
            />
        </NodeWrapper>
    )
}
