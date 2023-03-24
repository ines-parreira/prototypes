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
import {useWorkflowEntrypointContext} from '../hooks/useWorkflowEntrypoint'
import {useWorkflowConfigurationContext} from '../hooks/useWorkflowConfiguration'
import PlaceholderNode from './nodes/PlaceholderNode'
import {VisualBuilderNode} from './types'

import TriggerButtonNode from './nodes/TriggerButtonNode'
import NodeEditorDrawer from './NodeEditorDrawer'
import {useSyncWorkflowToReactFlow} from './hooks/useSyncWorkflowToReactFlow'
import useAutoLayout from './hooks/useAutoLayout'

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
    const {isFetchPending: isWorkflowEntrypointFetchPending} =
        useWorkflowEntrypointContext()
    const {isFetchPending: isWorkflowConfigurationFetchPending} =
        useWorkflowConfigurationContext()
    useSyncWorkflowToReactFlow()
    useAutoLayout()
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [edges, _setEdges, onEdgesChange] = useEdgesState([])
    const [visualBuilderNodeIdEditing, setVisualBuilderNodeIdEditing] =
        useState<VisualBuilderNode['id'] | null>(null)
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

    if (isWorkflowEntrypointFetchPending || isWorkflowConfigurationFetchPending)
        return <Loader />

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
                minZoom={0.75}
                maxZoom={1}
                nodesDraggable={false}
                nodesConnectable={false}
                zoomOnDoubleClick={false}
                onNodeClick={(_e, node) => {
                    if (node.type !== 'placeholder')
                        setVisualBuilderNodeIdEditing(node.id)
                }}
                elementsSelectable={false}
                nodesFocusable={false}
                edgesFocusable={false}
            >
                <Controls />
                <MiniMap zoomable pannable />
                <Background />
            </ReactFlow>
            <NodeEditorDrawer
                nodeInEdition={visualBuilderNodeEditing}
                onClose={() => setVisualBuilderNodeIdEditing(null)}
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
