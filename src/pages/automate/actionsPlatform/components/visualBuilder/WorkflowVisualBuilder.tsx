import 'reactflow/dist/style.css'

import React, {useCallback} from 'react'
import {
    MiniMap,
    NodeMouseHandler,
    ReactFlow,
    ReactFlowProvider,
} from 'reactflow'

import {gorgiasColors} from 'gorgias-design-system/styles'
import {VisualBuilderBackground} from 'pages/automate/workflows/editor/visualBuilder/components/VisualBuilderBackground'

import CustomEdge from 'pages/automate/workflows/editor/visualBuilder/CustomEdge'
import NodeEditorDrawer from 'pages/automate/workflows/editor/visualBuilder/NodeEditorDrawer'
import CancelOrderNode from 'pages/automate/workflows/editor/visualBuilder/nodes/CancelOrderNode'
import CancelSubscriptionNode from 'pages/automate/workflows/editor/visualBuilder/nodes/CancelSubscriptionNode'
import ConditionsNode from 'pages/automate/workflows/editor/visualBuilder/nodes/ConditionsNode'
import CreateDiscountCodeNode from 'pages/automate/workflows/editor/visualBuilder/nodes/CreateDiscountCodeNode'
import EndNode from 'pages/automate/workflows/editor/visualBuilder/nodes/EndNode'
import HttpRequestNode from 'pages/automate/workflows/editor/visualBuilder/nodes/HttpRequestNode'
import LLMPromptTriggerNode from 'pages/automate/workflows/editor/visualBuilder/nodes/LLMPromptTriggerNode'
import RefundOrderNode from 'pages/automate/workflows/editor/visualBuilder/nodes/RefundOrderNode'
import RefundShippingCostsNode from 'pages/automate/workflows/editor/visualBuilder/nodes/RefundShippingCostsNode'
import RemoveItemNode from 'pages/automate/workflows/editor/visualBuilder/nodes/RemoveItemNode'
import ReplaceItemNode from 'pages/automate/workflows/editor/visualBuilder/nodes/ReplaceItemNode'
import ReshipForFreeNode from 'pages/automate/workflows/editor/visualBuilder/nodes/ReshipForFreeNode'
import ReusableLLMPromptCallNode from 'pages/automate/workflows/editor/visualBuilder/nodes/ReusableLLMPromptCallNode'
import ReusableLLMPromptTriggerNode from 'pages/automate/workflows/editor/visualBuilder/nodes/ReusableLLMPromptTriggerNode'
import SkipChargeNode from 'pages/automate/workflows/editor/visualBuilder/nodes/SkipChargeNode'
import UpdateShippingAddressNode from 'pages/automate/workflows/editor/visualBuilder/nodes/UpdateShippingAddressNode'
import css from 'pages/automate/workflows/editor/visualBuilder/WorkflowVisualBuilder.less'
import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'

import VisualBuilderControls from './VisualBuilderControls'

const nodeTypes = {
    llm_prompt_trigger: LLMPromptTriggerNode,
    reusable_llm_prompt_trigger: ReusableLLMPromptTriggerNode,
    conditions: ConditionsNode,
    http_request: HttpRequestNode,
    cancel_order: CancelOrderNode,
    refund_order: RefundOrderNode,
    update_shipping_address: UpdateShippingAddressNode,
    remove_item: RemoveItemNode,
    replace_item: ReplaceItemNode,
    create_discount_code: CreateDiscountCodeNode,
    refund_shipping_costs: RefundShippingCostsNode,
    reship_for_free: ReshipForFreeNode,
    cancel_subscription: CancelSubscriptionNode,
    skip_charge: SkipChargeNode,
    reusable_llm_prompt_call: ReusableLLMPromptCallNode,
    end: EndNode,
}

const edgeTypes = {
    custom: CustomEdge,
}

type Props = {
    isMiniMapHidden?: boolean
    isDisabled?: boolean
}

const WorkflowVisualBuilder = ({
    isMiniMapHidden: isMiniMapHiddenProp = false,
    isDisabled = false,
}: Props) => {
    const {visualBuilderGraph, dispatch} = useVisualBuilderContext()

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

    // for big flows we disable some features to improve performance
    const isDegradedMode = visualBuilderGraph.nodes.length > 800
    const isMiniMapHidden = isMiniMapHiddenProp || isDegradedMode

    return (
        <div className={css.container}>
            <div className={css.reactFlowContainer}>
                <ReactFlowProvider>
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
                        onNodeClick={isDisabled ? undefined : handleNodeClick}
                        elementsSelectable={false}
                        nodesFocusable={false}
                        edgesFocusable={false}
                        zoomOnPinch
                        zoomOnScroll={false}
                        panOnScroll
                    >
                        {!isMiniMapHidden && (
                            <MiniMap
                                zoomable
                                pannable
                                position="top-left"
                                className={css.minimap}
                                maskColor={gorgiasColors.neutralGrey0}
                                nodeColor={gorgiasColors.neutralGrey3}
                            />
                        )}
                        <VisualBuilderControls
                            isMiniMapHidden={isMiniMapHidden}
                        />
                        <VisualBuilderBackground />
                    </ReactFlow>
                </ReactFlowProvider>
            </div>
            {!isDisabled && (
                <NodeEditorDrawer
                    nodeInEdition={visualBuilderNodeEditing}
                    onClose={handleDrawerEditorClose}
                />
            )}
        </div>
    )
}

export default WorkflowVisualBuilder
