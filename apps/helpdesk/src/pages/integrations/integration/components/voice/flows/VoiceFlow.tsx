import { useCallback, useEffect } from 'react'

import { CallRoutingFlow } from '@gorgias/helpdesk-types'

import {
    Background,
    CustomControls,
    Edge,
    Flow,
    useAutoLayout,
    useEdgesState,
    useNodesState,
} from 'core/ui/flows'
import { createFlowGraph } from 'core/ui/flows/utils'

import { VoiceFlowNodeType } from './constants'
import { EndCallNode } from './nodes/EndCallNode'
import { EnqueueNode } from './nodes/EnqueueNode'
import { IncomingCallNode } from './nodes/IncomingCallNode'
import { IntermediaryNode } from './nodes/IntermediaryNode'
import { IvrMenuNode } from './nodes/IvrMenuNode'
import { IvrOptionNode } from './nodes/IvrOptionNode'
import { PlayMessageNode } from './nodes/PlayMessageNode'
import { SendToSMSNode } from './nodes/SendToSMSNode'
import { SendToVoicemailNode } from './nodes/SendToVoicemailNode'
import { TimeSplitConditionalNode } from './nodes/TimeSplitConditionalNode'
import { TimeSplitOptionNode } from './nodes/TimeSplitOptionNode'
import { VoiceFlowNode } from './types'
import { getEdgeProps, getNextNodes, transformToReactFlowNodes } from './utils'
import { VoiceFlowEdge } from './VoiceFlowEdge'

const nodeTypes = {
    [VoiceFlowNodeType.IncomingCall]: IncomingCallNode,
    [VoiceFlowNodeType.IvrMenu]: IvrMenuNode,
    [VoiceFlowNodeType.IvrOption]: IvrOptionNode,
    [VoiceFlowNodeType.EndCall]: EndCallNode,
    [VoiceFlowNodeType.PlayMessage]: PlayMessageNode,
    [VoiceFlowNodeType.SendToVoicemail]: SendToVoicemailNode,
    [VoiceFlowNodeType.TimeSplitConditional]: TimeSplitConditionalNode,
    [VoiceFlowNodeType.TimeSplitOption]: TimeSplitOptionNode,
    [VoiceFlowNodeType.SendToSMS]: SendToSMSNode,
    [VoiceFlowNodeType.Intermediary]: IntermediaryNode,
    [VoiceFlowNodeType.Enqueue]: EnqueueNode,
}

const edgeTypes = {
    default: VoiceFlowEdge,
}

type VoiceFlowProps = {
    flow: CallRoutingFlow
}

export function VoiceFlow({ flow }: VoiceFlowProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState<VoiceFlowNode>([])
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
    const computeEdges = useCallback(
        (nodes: VoiceFlowNode[]) => createFlowGraph(nodes, getNextNodes).edges,
        [],
    )

    useAutoLayout<VoiceFlowNode>(getEdgeProps, computeEdges)

    useEffect(() => {
        const newNodes = transformToReactFlowNodes(flow)
        const newEdges = computeEdges(newNodes)
        setNodes(newNodes)
        setEdges(newEdges)
    }, [flow, setNodes, setEdges])

    return (
        <Flow<VoiceFlowNode, Edge>
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
        >
            <Background />
            <CustomControls />
        </Flow>
    )
}
