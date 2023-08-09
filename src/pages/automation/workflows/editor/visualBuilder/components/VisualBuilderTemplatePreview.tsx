import React, {PropsWithChildren} from 'react'
import {Background, ReactFlow, ReactFlowProvider, Controls} from 'reactflow'

import {VisualBuilderGraph} from 'pages/automation/workflows/models/visualBuilderGraph.types'
import {
    WorkflowEditorContext,
    createWorkflowEditorContextForPreview,
} from 'pages/automation/workflows/hooks/useWorkflowEditor'
import {
    WorkflowChannelSupportContext,
    createWorkflowChannelSupportContextForPreview,
} from 'pages/automation/workflows/hooks/useWorkflowChannelSupport'

import TriggerButtonNode from '../nodes/TriggerButtonNode'
import AutomatedMessageNode from '../nodes/AutomatedMessageNode'
import MultipleChoicesNode from '../nodes/MultipleChoicesNode'
import EndNode from '../nodes/EndNode'
import CustomEdge from '../CustomEdge'
import {
    createSelfServiceStoreIntegrationContextForPreview,
    StoreIntegrationContext,
} from '../../../../common/hooks/useSelfServiceStoreIntegration'

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
    return (
        <ReactFlow
            proOptions={{
                hideAttribution: true,
            }}
            fitView
            fitViewOptions={{
                duration: 0,
            }}
            nodes={visualBuilderGraph.nodes}
            edges={visualBuilderGraph.edges}
            edgeTypes={edgeTypes}
            nodeTypes={nodeTypes}
            minZoom={0.1}
            maxZoom={1}
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
        const workflowChannelSupportContextValue =
            createWorkflowChannelSupportContextForPreview()
        const selfServiceStoreIntegrationContextValue =
            createSelfServiceStoreIntegrationContextForPreview()
        return (
            <WorkflowEditorContext.Provider value={workflowEditorContextValue}>
                <WorkflowChannelSupportContext.Provider
                    value={workflowChannelSupportContextValue}
                >
                    <StoreIntegrationContext.Provider
                        value={selfServiceStoreIntegrationContextValue}
                    >
                        <ReactFlowProvider>
                            <Component {...props} />
                        </ReactFlowProvider>
                    </StoreIntegrationContext.Provider>
                </WorkflowChannelSupportContext.Provider>
            </WorkflowEditorContext.Provider>
        )
    }
}

export default withProviders(VisualBuilderTemplatePreview)
