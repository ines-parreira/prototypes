import React, {PropsWithChildren, useEffect, useState} from 'react'
import {
    ReactFlow,
    Background,
    MiniMap,
    Controls,
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
    Node,
    useReactFlow,
} from 'reactflow'

import Loader from 'pages/common/components/Loader/Loader'
import {useWorkflowEditorContext} from '../../hooks/useWorkflowEditor'
import {VisualBuilderNode} from '../../models/visualBuilderGraph.types'
import useAutoLayout from '../../hooks/useAutoLayout'
import TriggerButtonNode from './nodes/TriggerButtonNode'
import AutomatedMessageNode from './nodes/AutomatedMessageNode'
import MultipleChoicesNode from './nodes/MultipleChoicesNode'
import EndNode from './nodes/EndNode'
import CustomEdge from './CustomEdge'
import NodeEditorDrawer from './NodeEditorDrawer'

import 'reactflow/dist/style.css'

const nodeTypes = {
    trigger_button: TriggerButtonNode,
    automated_message: AutomatedMessageNode,
    multiple_choices: MultipleChoicesNode,
    end: EndNode,
}

const edgeTypes = {
    custom: CustomEdge,
}

type WorkflowVisualBuilderProps = {
    lastSaveAttempt?: Date
}

export function WorkflowVisualBuilderWrapped({
    lastSaveAttempt,
}: WorkflowVisualBuilderProps) {
    const {
        isFetchPending,
        visualBuilderGraph,
        visualBuilderNodeIdEditing,
        setVisualBuilderNodeIdEditing,
    } = useWorkflowEditorContext()
    const {minZoom, maxZoom} = useAutoLayout()
    const {getNodes} = useReactFlow()
    const [nodes, setNodes, onNodesChange] = useNodesState<
        VisualBuilderNode['data']
    >(visualBuilderGraph.nodes)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [edges, setEdges, onEdgesChange] = useEdgesState(
        visualBuilderGraph.edges
    )
    const [nodeEditorDrawerOpen, setNodeEditorDrawerOpen] = useState(false)
    const visualBuilderNodeEditing = visualBuilderNodeIdEditing
        ? (nodes.find(
              (n) => n.id === visualBuilderNodeIdEditing
          ) as VisualBuilderNode)
        : null

    useEffect(() => {
        const existingNodes = getNodes().reduce(
            (acc, n) => ({
                ...acc,
                [n.id]: n,
            }),
            {} as Record<string, Node>
        )
        setNodes(
            visualBuilderGraph.nodes.map((n) => ({
                ...n,
                data: {...n.data, shouldShowErrors: lastSaveAttempt != null},
                position: existingNodes[n.id]?.position || n.position,
                width: existingNodes[n.id]?.width || n.width,
                height: existingNodes[n.id]?.height || n.height,
            }))
        )
        setEdges(visualBuilderGraph.edges)
    }, [visualBuilderGraph, setNodes, setEdges, getNodes, lastSaveAttempt])

    if (isFetchPending) return <Loader />

    return (
        <>
            <ReactFlow
                proOptions={{
                    hideAttribution: true,
                }}
                fitView
                fitViewOptions={{
                    duration: 0,
                }}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                edgeTypes={edgeTypes}
                nodeTypes={nodeTypes}
                minZoom={minZoom}
                maxZoom={maxZoom}
                nodesDraggable={false}
                nodesConnectable={false}
                zoomOnDoubleClick={false}
                onNodeClick={(_e, node) => {
                    if (node.type !== 'end') {
                        setVisualBuilderNodeIdEditing(node.id)
                        setNodeEditorDrawerOpen(true)
                    }
                }}
                elementsSelectable={false}
                nodesFocusable={false}
                edgesFocusable={false}
                zoomOnPinch={true}
                zoomOnScroll={false}
                panOnScroll={true}
            >
                <MiniMap zoomable pannable position="top-left" />
                <Controls
                    showInteractive={false}
                    position="top-left"
                    style={{left: 200 + 15}}
                />
                <Background />
            </ReactFlow>
            <NodeEditorDrawer
                open={nodeEditorDrawerOpen}
                nodeInEdition={visualBuilderNodeEditing}
                onClose={() => {
                    setNodeEditorDrawerOpen(false)
                    setTimeout(() => {
                        setVisualBuilderNodeIdEditing(null)
                    }, 300)
                }}
            />
        </>
    )
}

function withProviders<T>(Component: React.FC<T>): React.FC<T> {
    return (props: PropsWithChildren<T>) => (
        <ReactFlowProvider>
            <Component {...props} />
        </ReactFlowProvider>
    )
}

export default withProviders(WorkflowVisualBuilderWrapped)
