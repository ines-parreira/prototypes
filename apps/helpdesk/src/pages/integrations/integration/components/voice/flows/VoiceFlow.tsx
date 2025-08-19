import { Background, Edge } from '@xyflow/react'

import { CustomControls, Flow } from 'core/ui/flows'

import { VoiceFlowNodeType } from './constants'
import { EndCallNode } from './nodes/EndCallNode'
import { IncomingCallNode } from './nodes/IncomingCallNode'
import { VoiceFlowNode } from './types'
import { VoiceFlowEdge } from './VoiceFlowEdge'

const nodeTypes = {
    [VoiceFlowNodeType.IncomingCall]: IncomingCallNode,
    [VoiceFlowNodeType.EndCall]: EndCallNode,
}

const edgeTypes = {
    default: VoiceFlowEdge,
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
            edgeTypes={edgeTypes}
        >
            <Background />
            <CustomControls />
        </Flow>
    )
}
