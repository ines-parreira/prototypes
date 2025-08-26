import { AddStepButton, NodeProps, NodeWrapper } from 'core/ui/flows'

import { FINAL_NODES_TYPES, VoiceFlowNodeType } from '../constants'
import type { IntermediaryNode } from '../types'
import { useVoiceFlow } from '../useVoiceFlow'

export function IntermediaryNode(props: NodeProps<IntermediaryNode>) {
    const { getNode, getEdges } = useVoiceFlow()

    const incomingNodeIds = getEdges()
        .filter((e) => e.target === props.id)
        .map((e) => e.source)

    const isFinal = incomingNodeIds.every((id) =>
        FINAL_NODES_TYPES.includes(
            getNode(id)?.type ?? VoiceFlowNodeType.Intermediary,
        ),
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
                <AddStepButton>Add step</AddStepButton>
            )}
        </NodeWrapper>
    )
}
