import React, {PropsWithChildren, useCallback} from 'react'
import {
    ReactFlow,
    ReactFlowProvider,
    Controls,
    ControlButton,
    useReactFlow,
} from 'reactflow'

import FitViewIcon from 'pages/automate/common/components/FitViewIcon'
import {
    createVisualBuilderContextForPreview,
    VisualBuilderContext,
} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    WorkflowChannelSupportContext,
    createWorkflowChannelSupportContextForPreview,
} from 'pages/automate/workflows/hooks/useWorkflowChannelSupport'
import {
    WorkflowEditorContext,
    createWorkflowEditorContextForPreview,
} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import {VisualBuilderGraph} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import {
    createSelfServiceStoreIntegrationContextForPreview,
    StoreIntegrationContext,
} from '../../../../common/hooks/useSelfServiceStoreIntegration'
import CustomEdge from '../CustomEdge'
import AutomatedMessageNode from '../nodes/AutomatedMessageNode'
import ChannelTriggerNode from '../nodes/ChannelTriggerNode'
import EndNode from '../nodes/EndNode'
import FileUploadNode from '../nodes/FileUploadNode'
import HttpRequestNode from '../nodes/HttpRequestNode'
import MultipleChoicesNode from '../nodes/MultipleChoicesNode'
import OrderSelectionNode from '../nodes/OrderSelectionNode'
import ShopperAuthenticationNode from '../nodes/ShopperAuthenticationNode'
import TextReplyNode from '../nodes/TextReplyNode'
import css from '../WorkflowVisualBuilder.less'
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
    const {fitView} = useReactFlow()
    const handleFitView = useCallback(() => fitView(), [fitView])
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
            <Controls
                className={css.controls}
                showFitView={false}
                showInteractive={false}
                position="top-left"
            >
                <ControlButton
                    aria-label="fit view"
                    title="fit view"
                    onClick={handleFitView}
                >
                    <FitViewIcon />
                </ControlButton>
            </Controls>
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
