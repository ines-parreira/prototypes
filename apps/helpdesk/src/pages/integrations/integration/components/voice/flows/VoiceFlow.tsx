import { Background, Edge } from 'reactflow'

import { CustomControls, Flow } from 'core/ui/flows'

import { VoiceFlowNodeType } from './constants'
import { EndCallNode } from './nodes/EndCallNode'
import { IncomingCallNode } from './nodes/IncomingCallNode'
import { VoiceFlowNode } from './types'

const nodeTypes = {
    [VoiceFlowNodeType.IncomingCall]: IncomingCallNode,
    [VoiceFlowNodeType.EndCall]: EndCallNode,
}

type VoiceFlowProps = {
    nodes?: VoiceFlowNode[]
    edges?: Edge[]
}

export function VoiceFlow({ nodes, edges }: VoiceFlowProps) {
    return (
        <Flow<VoiceFlowNode, Edge>
            nodes={nodes ?? []}
            edges={edges ?? []}
            nodeTypes={nodeTypes}
        >
            <Background />
            <CustomControls />
        </Flow>
    )
}
