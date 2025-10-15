import { useCallback, useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { Controls } from '@xyflow/react'

import { CallRoutingFlow } from '@gorgias/helpdesk-types'

import { useFlag } from 'core/flags'
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
import { DEPRECATED_EnqueueNode } from './nodes/DEPRECATED_EnqueueNode'
import { nodeTypes } from './nodeTypes'
import { VoiceFlowNode } from './types'
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
    const isExtendedCallFlowsGAReady = useFlag(
        FeatureFlagKey.ExtendedCallFlowsGAReady,
    )

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
                nodeTypes={
                    isExtendedCallFlowsGAReady
                        ? nodeTypes
                        : {
                              ...nodeTypes,
                              [VoiceFlowNodeType.Enqueue]:
                                  DEPRECATED_EnqueueNode,
                          }
                }
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
