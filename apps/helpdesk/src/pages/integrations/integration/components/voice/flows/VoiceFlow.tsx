import { useCallback, useMemo } from 'react'

import { Controls } from '@xyflow/react'

import type { CallRoutingFlow } from '@gorgias/helpdesk-types'

import type { Edge } from 'core/ui/flows'
import {
    Background,
    CustomControls,
    Flow,
    useAutoLayout,
    useEdgesState,
    useNodesState,
} from 'core/ui/flows'
import { createFlowGraph } from 'core/ui/flows/utils'

import { nodeTypes } from './nodeTypes'
import type { VoiceFlowNode } from './types'
import { getEdgeProps, getNextNodes, transformToReactFlowNodes } from './utils'
import { VoiceFlowEdge, VoiceFlowPreviewEdge } from './VoiceFlowEdge'
import VoiceFlowProvider from './VoiceFlowProvider'

const edgeTypes = {
    default: VoiceFlowEdge,
}

const previewEdgeType = {
    default: VoiceFlowPreviewEdge,
}

type VoiceFlowProps = {
    flow: CallRoutingFlow
    preview?: boolean
}

export function VoiceFlow({ flow, preview = false }: VoiceFlowProps) {
    const computeEdges = useCallback(
        (nodes: VoiceFlowNode[]) => createFlowGraph(nodes, getNextNodes).edges,
        [],
    )

    const newNodes = useMemo(() => transformToReactFlowNodes(flow), [flow])
    const newEdges = useMemo(
        () => computeEdges(newNodes),
        [newNodes, computeEdges],
    )
    const [nodes, , onNodesChange] = useNodesState<VoiceFlowNode>(newNodes)
    const [edges, , onEdgesChange] = useEdgesState<Edge>(newEdges)

    useAutoLayout<VoiceFlowNode>(getEdgeProps, computeEdges)

    return (
        <VoiceFlowProvider>
            <Flow<VoiceFlowNode, Edge>
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={preview ? previewEdgeType : edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onlyRenderVisibleElements={false}
                elementsSelectable={!preview}
            >
                <Background />
                {preview ? (
                    <Controls position={'top-left'} showInteractive={false} />
                ) : (
                    <CustomControls />
                )}
            </Flow>
        </VoiceFlowProvider>
    )
}
