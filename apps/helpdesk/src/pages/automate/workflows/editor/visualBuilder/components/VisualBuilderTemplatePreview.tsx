import type { PropsWithChildren } from 'react'
import type React from 'react'
import { useCallback } from 'react'

import {
    ControlButton,
    Controls,
    ReactFlow,
    ReactFlowProvider,
    useReactFlow,
} from '@xyflow/react'

import { FitViewIcon } from 'pages/automate/common/components/FitViewIcon'
import {
    createSelfServiceStoreIntegrationContextForPreview,
    StoreIntegrationContext,
} from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import {
    createVisualBuilderContextForPreview,
    VisualBuilderContext,
} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    createWorkflowChannelSupportContextForPreview,
    WorkflowChannelSupportContext,
} from 'pages/automate/workflows/hooks/useWorkflowChannelSupport'
import {
    createWorkflowEditorContextForPreview,
    WorkflowEditorContext,
} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import type {
    ChannelTriggerNodeType,
    VisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import { CustomEdge } from '../CustomEdge'
import { AutomatedMessageNodeWrapper as AutomatedMessageNode } from '../nodes/AutomatedMessageNode'
import { ChannelTriggerNodeWrapper as ChannelTriggerNode } from '../nodes/ChannelTriggerNode'
import { EndNodeWrapper as EndNode } from '../nodes/EndNode'
import { FileUploadNodeWrapper as FileUploadNode } from '../nodes/FileUploadNode'
import { HttpRequestNodeWrapper as HttpRequestNode } from '../nodes/HttpRequestNode'
import { MultipleChoicesNodeWrapper as MultipleChoicesNode } from '../nodes/MultipleChoicesNode'
import { OrderSelectionNodeWrapper as OrderSelectionNode } from '../nodes/OrderSelectionNode'
import { ShopperAuthenticationNodeWrapper as ShopperAuthenticationNode } from '../nodes/ShopperAuthenticationNode'
import { TextReplyNodeWrapper as TextReplyNode } from '../nodes/TextReplyNode'
import { VisualBuilderBackground } from './VisualBuilderBackground'

import css from '../WorkflowVisualBuilder.less'

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
    const { fitView } = useReactFlow()
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

function withProviders<
    T extends {
        visualBuilderGraph: VisualBuilderGraph<ChannelTriggerNodeType>
    },
>(Component: React.FC<T>): React.FC<T> {
    return (props: PropsWithChildren<T>) => {
        const workflowEditorContextValue =
            createWorkflowEditorContextForPreview(props.visualBuilderGraph)
        const workflowChannelSupportContextValue =
            createWorkflowChannelSupportContextForPreview()
        const selfServiceStoreIntegrationContextValue =
            createSelfServiceStoreIntegrationContextForPreview()
        const visualBuilderContextValue = createVisualBuilderContextForPreview(
            props.visualBuilderGraph,
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

const DefaultExportVisualBuilderTemplatePreview = withProviders(
    VisualBuilderTemplatePreview,
)

export { DefaultExportVisualBuilderTemplatePreview }
