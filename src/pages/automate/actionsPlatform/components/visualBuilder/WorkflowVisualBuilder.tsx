import 'reactflow/dist/style.css'

import React, {Dispatch, PropsWithChildren, useCallback, FC} from 'react'
import {
    Controls,
    MiniMap,
    NodeMouseHandler,
    ReactFlow,
    ReactFlowProvider,
    useNodesInitialized,
} from 'reactflow'
import classnames from 'classnames'

import Loader from 'pages/common/components/Loader/Loader'

import {withVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {VisualBuilderGraph} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {VisualBuilderGraphAction} from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import {VisualBuilderBackground} from 'pages/automate/workflows/editor/visualBuilder/components/VisualBuilderBackground'

import LLMPromptTriggerNode from 'pages/automate/workflows/editor/visualBuilder/nodes/LLMPromptTriggerNode'
import EndNode from 'pages/automate/workflows/editor/visualBuilder/nodes/EndNode'
import HttpRequestNode from 'pages/automate/workflows/editor/visualBuilder/nodes/HttpRequestNode'
import ConditionsNode from 'pages/automate/workflows/editor/visualBuilder/nodes/ConditionsNode'
import CancelOrderNode from 'pages/automate/workflows/editor/visualBuilder/nodes/CancelOrderNode'
import RefundOrderNode from 'pages/automate/workflows/editor/visualBuilder/nodes/RefundOrderNode'
import UpdateShippingAddressNode from 'pages/automate/workflows/editor/visualBuilder/nodes/UpdateShippingAddressNode'
import RemoveItemNode from 'pages/automate/workflows/editor/visualBuilder/nodes/RemoveItemNode'
import CancelSubscriptionNode from 'pages/automate/workflows/editor/visualBuilder/nodes/CancelSubscriptionNode'
import SkipChargeNode from 'pages/automate/workflows/editor/visualBuilder/nodes/SkipChargeNode'
import CustomEdge from 'pages/automate/workflows/editor/visualBuilder/CustomEdge'
import NodeEditorDrawer from 'pages/automate/workflows/editor/visualBuilder/NodeEditorDrawer'

import css from 'pages/automate/workflows/editor/visualBuilder/WorkflowVisualBuilder.less'

const nodeTypes = {
    llm_prompt_trigger: LLMPromptTriggerNode,
    conditions: ConditionsNode,
    http_request: HttpRequestNode,
    cancel_order: CancelOrderNode,
    refund_order: RefundOrderNode,
    update_shipping_address: UpdateShippingAddressNode,
    remove_item: RemoveItemNode,
    cancel_subscription: CancelSubscriptionNode,
    skip_charge: SkipChargeNode,
    end: EndNode,
}

const edgeTypes = {
    custom: CustomEdge,
}

type Props = {
    visualBuilderGraph: VisualBuilderGraph
    dispatch: Dispatch<VisualBuilderGraphAction>
}

const WorkflowVisualBuilderWrapped = ({
    visualBuilderGraph,
    dispatch,
}: Props) => {
    const visualBuilderNodeEditing = visualBuilderGraph.nodeEditingId
        ? visualBuilderGraph.nodes.find(
              (n) => n.id === visualBuilderGraph.nodeEditingId
          )
        : null

    const handleDrawerEditorClose = useCallback(() => {
        dispatch({type: 'CLOSE_EDITOR'})
    }, [dispatch])

    const handleNodeClick = useCallback<NodeMouseHandler>(
        (_event, node) => {
            dispatch({
                type: 'SET_NODE_EDITING_ID',
                nodeId: node.id,
            })
        },
        [dispatch]
    )

    const areNodesInitialized = useNodesInitialized()

    // for big flows we disable some features to improve performance
    const isDegradedMode = visualBuilderGraph.nodes.length > 800

    return (
        <div className={css.container}>
            {!areNodesInitialized && <Loader />}
            <div
                className={classnames(css.reactFlowContainer, {
                    [css.transparent]: !areNodesInitialized,
                })}
            >
                <ReactFlow
                    proOptions={{
                        hideAttribution: true,
                    }}
                    fitView
                    fitViewOptions={{
                        duration: 0,
                    }}
                    onlyRenderVisibleElements
                    nodes={visualBuilderGraph.nodes}
                    edges={visualBuilderGraph.edges}
                    edgeTypes={edgeTypes}
                    nodeTypes={nodeTypes}
                    minZoom={0.1}
                    maxZoom={1}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    zoomOnDoubleClick={false}
                    onNodeClick={handleNodeClick}
                    elementsSelectable={false}
                    nodesFocusable={false}
                    edgesFocusable={false}
                    zoomOnPinch={true}
                    zoomOnScroll={false}
                    panOnScroll={true}
                >
                    {!isDegradedMode && (
                        <MiniMap
                            zoomable
                            pannable
                            position="top-left"
                            className={css.minimap}
                        />
                    )}
                    <Controls
                        showInteractive={false}
                        position="top-left"
                        style={!isDegradedMode ? {left: 200 + 15} : {}}
                    />
                    <VisualBuilderBackground />
                </ReactFlow>
            </div>
            <NodeEditorDrawer
                nodeInEdition={visualBuilderNodeEditing}
                onClose={handleDrawerEditorClose}
            />
        </div>
    )
}

function withProviders<T>(Component: FC<T>): FC<T> {
    return (props: PropsWithChildren<T>) => (
        <ReactFlowProvider>
            <Component {...props} />
        </ReactFlowProvider>
    )
}

export default withProviders(
    withVisualBuilderContext(WorkflowVisualBuilderWrapped)
)
