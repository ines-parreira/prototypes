import React, {PropsWithChildren, useEffect, useState} from 'react'
import {
    ReactFlow,
    Background,
    MiniMap,
    Controls,
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
} from 'reactflow'

import Loader from 'pages/common/components/Loader/Loader'
import {useWorkflowConfigurationContext} from '../../hooks/useWorkflowConfiguration'
import {VisualBuilderNode} from '../../models/visualBuilderGraph.types'
import {useSyncWorkflowToReactFlow} from '../../hooks/useSyncWorkflowToReactFlow'
import useAutoLayout from '../../hooks/useAutoLayout'
import PlaceholderNode from './nodes/PlaceholderNode'
import TriggerButtonNode from './nodes/TriggerButtonNode'
import NodeEditorDrawer from './NodeEditorDrawer'

import 'reactflow/dist/style.css'
import AutomatedMessageNode from './nodes/AutomatedMessageNode'
import ReplyButtonNode from './nodes/ReplyButtonNode'

const nodeTypes = {
    trigger_button: TriggerButtonNode,
    automated_message: AutomatedMessageNode,
    reply_button: ReplyButtonNode,
    placeholder: PlaceholderNode,
}

type WorkflowVisualBuilderProps = {
    lastSaveAttempt?: Date
}

export function WorkflowVisualBuilderWrapped({
    lastSaveAttempt,
}: WorkflowVisualBuilderProps) {
    const {isFetchPending} = useWorkflowConfigurationContext()
    useSyncWorkflowToReactFlow()
    const {minZoom, maxZoom} = useAutoLayout()
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [edges, _setEdges, onEdgesChange] = useEdgesState([])
    const [visualBuilderNodeIdEditing, setVisualBuilderNodeIdEditing] =
        useState<VisualBuilderNode['id'] | null>(null)
    const [nodeEditorDrawerOpen, setNodeEditorDrawerOpen] = useState(false)
    const visualBuilderNodeEditing = visualBuilderNodeIdEditing
        ? (nodes.find(
              (n) => n.id === visualBuilderNodeIdEditing
          ) as VisualBuilderNode)
        : null

    useEffect(() => {
        setNodes((nodes) =>
            nodes.map((n) => ({
                ...n,
                data: {...n.data, shouldShowErrors: lastSaveAttempt != null},
            }))
        )
    }, [lastSaveAttempt, setNodes])

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
                nodeTypes={nodeTypes}
                minZoom={minZoom}
                maxZoom={maxZoom}
                nodesDraggable={false}
                nodesConnectable={false}
                zoomOnDoubleClick={false}
                onNodeClick={(_e, node) => {
                    if (node.type !== 'placeholder') {
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
