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
import {
    createVisualBuilderContextForPreview,
    VisualBuilderContext,
} from 'pages/automate/workflows/hooks/useVisualBuilder'

import ChannelTriggerNode from '../nodes/ChannelTriggerNode'
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
import OrderSelectionNode from '../nodes/OrderSelectionNode'
import HttpRequestNode from '../nodes/HttpRequestNode'
import ShopperAuthenticationNode from '../nodes/ShopperAuthenticationNode'
import {VisualBuilderBackground} from './VisualBuilderBackground'

type VisualBuilderTemplatePreviewProps = {
    visualBuilderGraph: VisualBuilderGraph
}

const nodeTypes = {
    channel_trigger: ChannelTriggerNode,
    automated_message: AutomatedMessageNode,
    multiple_choices: MultipleChoicesNode,
    text_reply: TextReplyNode,
    file_upload: FileUploadNode,
    order_selection: OrderSelectionNode,
    shopper_authentication: ShopperAuthenticationNode,
    http_request: HttpRequestNode,
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
        const visualBuilderContextValue = createVisualBuilderContextForPreview(
            props.visualBuilderGraph
        )
        return (
            <StoreIntegrationContext.Provider
                value={selfServiceStoreIntegrationContextValue}
            >
                <WorkflowEditorContext.Provider
                    value={workflowEditorContextValue}
                >
                    <WorkflowChannelSupportContext.Provider
                        value={workflowChannelSupportContextValue}
                    >
                        <VisualBuilderContext.Provider
                            value={visualBuilderContextValue}
                        >
                            <ReactFlowProvider>
                                <Component {...props} />
                            </ReactFlowProvider>
                        </VisualBuilderContext.Provider>
                    </WorkflowChannelSupportContext.Provider>
                </WorkflowEditorContext.Provider>
            </StoreIntegrationContext.Provider>
        )
    }
}

export default withProviders(VisualBuilderTemplatePreview)
