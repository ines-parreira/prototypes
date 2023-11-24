import React, {PropsWithChildren} from 'react'
import {ReactFlow, ReactFlowProvider, Controls} from 'reactflow'

import {VisualBuilderGraph} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {
    WorkflowEditorContext,
    createWorkflowEditorContextForPreview,
} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import {
    WorkflowChannelSupportContext,
    createWorkflowChannelSupportContextForPreview,
} from 'pages/automate/workflows/hooks/useWorkflowChannelSupport'

import TriggerButtonNode from '../nodes/TriggerButtonNode'
import AutomatedMessageNode from '../nodes/AutomatedMessageNode'
import MultipleChoicesNode from '../nodes/MultipleChoicesNode'
import EndNode from '../nodes/EndNode'
import TextReplyNode from '../nodes/TextReplyNode'
import FileUploadNode from '../nodes/FileUploadNode'
import CustomEdge from '../CustomEdge'
import {
    createSelfServiceStoreIntegrationContextForPreview,
    StoreIntegrationContext,
} from '../../../../common/hooks/useSelfServiceStoreIntegration'
import {VisualBuilderBackground} from './VisualBuilderBackground'

type VisualBuilderTemplatePreviewProps = {
    visualBuilderGraph: VisualBuilderGraph
}

const nodeTypes = {
    trigger_button: TriggerButtonNode,
    automated_message: AutomatedMessageNode,
    multiple_choices: MultipleChoicesNode,
    text_reply: TextReplyNode,
    file_upload: FileUploadNode,
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
            <VisualBuilderBackground />
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
