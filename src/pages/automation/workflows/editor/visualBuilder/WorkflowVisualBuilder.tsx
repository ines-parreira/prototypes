import React, {useEffect, useMemo} from 'react'
import {
    ReactFlow,
    Background,
    MiniMap,
    Controls,
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
    Node,
} from 'reactflow'

import Loader from 'pages/common/components/Loader/Loader'
import {useWorkflowEntrypointContext} from '../hooks/useWorkflowEntrypoint'
import PlaceholderNode from './nodes/PlaceholderNode'
import {TriggerButtonNodeType} from './types'

import 'reactflow/dist/style.css'
import TriggerButtonNode from './nodes/TriggerButtonNode'

const nodeTypes = {
    trigger_button: TriggerButtonNode,
    placeholder: PlaceholderNode,
}

const placeholderNode: Node = {
    id: 'b',
    type: 'placeholder',
    data: {},
    // temporary manual setting of node coordinates
    position: {x: 0, y: 96 - 52},
}

export function WorkflowVisualBuilderWrapped() {
    const workflowEntrypointContext = useWorkflowEntrypointContext()
    const triggerButtonNode: TriggerButtonNodeType = useMemo(
        () => ({
            id: 'a',
            type: 'trigger_button',
            data: {
                entrypoint_label: workflowEntrypointContext.label,
            },
            // temporary manual setting of node coordinates
            position: {x: 0, y: -52},
        }),
        [workflowEntrypointContext.label]
    )
    const [nodes, setNodes, onNodesChange] = useNodesState([
        triggerButtonNode,
        placeholderNode,
    ])
    useEffect(() => {
        setNodes([triggerButtonNode, placeholderNode])
    }, [setNodes, triggerButtonNode])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [edges, _setEdges, onEdgesChange] = useEdgesState([
        {
            id: 'default',
            source: 'a',
            target: 'b',
            type: 'smoothstep',
            style: {stroke: '#D2D7DE'},
        },
    ])

    if (workflowEntrypointContext.isFetchPending) return <Loader />
    return (
        <>
            <ReactFlow
                proOptions={{
                    hideAttribution: true,
                }}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.5}
                maxZoom={1}
                nodesDraggable={false}
                nodesConnectable={false}
                zoomOnDoubleClick={false}
            >
                <Controls />
                <MiniMap zoomable pannable />
                <Background />
            </ReactFlow>
        </>
    )
}

function withProviders(Component: React.FC): React.FC {
    return () => (
        <ReactFlowProvider>
            <Component />
        </ReactFlowProvider>
    )
}

export default withProviders(WorkflowVisualBuilderWrapped)
