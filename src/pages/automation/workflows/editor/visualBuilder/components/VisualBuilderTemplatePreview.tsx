import React, {PropsWithChildren, useEffect} from 'react'
import {
    Background,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow,
    Node,
    Controls,
} from 'reactflow'

import {
    VisualBuilderGraph,
    VisualBuilderNode,
} from 'pages/automation/workflows/models/visualBuilderGraph.types'
import {
    WorkflowEditorContext,
    createWorkflowEditorContextForPreview,
} from 'pages/automation/workflows/hooks/useWorkflowEditor'
import useAutoLayout from 'pages/automation/workflows/hooks/useAutoLayout'

import TriggerButtonNode from '../nodes/TriggerButtonNode'
import AutomatedMessageNode from '../nodes/AutomatedMessageNode'
import MultipleChoicesNode from '../nodes/MultipleChoicesNode'
import EndNode from '../nodes/EndNode'
import CustomEdge from '../CustomEdge'

type VisualBuilderTemplatePreviewProps = {
    visualBuilderGraph: VisualBuilderGraph
}

const nodeTypes = {
    trigger_button: TriggerButtonNode,
    automated_message: AutomatedMessageNode,
    multiple_choices: MultipleChoicesNode,
    end: EndNode,
}

const edgeTypes = {
    custom: CustomEdge,
}

function VisualBuilderTemplatePreview({
    visualBuilderGraph,
}: VisualBuilderTemplatePreviewProps) {
    const {getNodes} = useReactFlow()
    const {minZoom, maxZoom} = useAutoLayout()
    const [nodes, setNodes, onNodesChange] = useNodesState<
        VisualBuilderNode['data']
    >(visualBuilderGraph.nodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(
        visualBuilderGraph.edges
    )
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
                position: existingNodes[n.id]?.position || n.position,
                width: existingNodes[n.id]?.width || n.width,
                height: existingNodes[n.id]?.height || n.height,
            }))
        )
        setEdges(visualBuilderGraph.edges)
    }, [visualBuilderGraph, setNodes, setEdges, getNodes])
    return (
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
            elementsSelectable={false}
            nodesFocusable={false}
            edgesFocusable={false}
            zoomOnPinch={true}
            zoomOnScroll={false}
            panOnScroll={true}
        >
            <Controls showInteractive={false} position="top-left" />
            <Background />
        </ReactFlow>
    )
}

function withProviders<T extends {visualBuilderGraph: VisualBuilderGraph}>(
    Component: React.FC<T>
): React.FC<T> {
    return (props: PropsWithChildren<T>) => {
        const workflowEditorContextValue =
            createWorkflowEditorContextForPreview(props.visualBuilderGraph)
        return (
            <WorkflowEditorContext.Provider value={workflowEditorContextValue}>
                <ReactFlowProvider>
                    <Component {...props} />
                </ReactFlowProvider>
            </WorkflowEditorContext.Provider>
        )
    }
}

export default withProviders(VisualBuilderTemplatePreview)
