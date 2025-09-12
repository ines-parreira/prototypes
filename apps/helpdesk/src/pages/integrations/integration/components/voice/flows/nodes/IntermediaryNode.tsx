import { AddStepButton, NodeProps, NodeWrapper } from 'core/ui/flows'

import AddStepMenuContent from '../AddStepMenuContent'
import { FINAL_NODES_TYPES } from '../constants'
import type { IntermediaryNode } from '../types'
import { useVoiceFlow } from '../useVoiceFlow'
import { getSourceNodes } from '../utils'

export function IntermediaryNode(props: NodeProps<IntermediaryNode>) {
    const { getNode, getNodes } = useVoiceFlow()

    // More than 1 non-final node is converging to this intermediary node
    const sourceNodes = getSourceNodes(getNode(props.id)!, getNodes())
    const isFinal = sourceNodes.some((node) =>
        FINAL_NODES_TYPES.includes(node.type),
    )

    return (
        <NodeWrapper {...props}>
            {isFinal ? (
                <div
                    style={{
                        height: '1px',
                        width: '1px',
                        content: '',
                    }}
                ></div>
            ) : (
                <AddStepButton>
                    <AddStepMenuContent
                        source={props.id}
                        target={props.data.next_step_id}
                    />
                </AddStepButton>
            )}
        </NodeWrapper>
    )
}
