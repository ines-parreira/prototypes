import '@xyflow/react/dist/style.css'

import React, { useCallback, useEffect } from 'react'

import type { NodeMouseHandler } from '@xyflow/react'
import {
    MiniMap,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
} from '@xyflow/react'

import { THEME_NAME } from '@gorgias/design-tokens'

import { useTheme } from 'core/theme'
import { VisualBuilderBackground } from 'pages/automate/workflows/editor/visualBuilder/components/VisualBuilderBackground'
import { CustomEdge } from 'pages/automate/workflows/editor/visualBuilder/CustomEdge'
import { NodeEditorDrawer } from 'pages/automate/workflows/editor/visualBuilder/NodeEditorDrawer'
import { CancelOrderNodeWrapper as CancelOrderNode } from 'pages/automate/workflows/editor/visualBuilder/nodes/CancelOrderNode'
import { CancelSubscriptionNodeWrapper as CancelSubscriptionNode } from 'pages/automate/workflows/editor/visualBuilder/nodes/CancelSubscriptionNode'
import { ConditionsNodeWrapper as ConditionsNode } from 'pages/automate/workflows/editor/visualBuilder/nodes/ConditionsNode'
import { CreateDiscountCodeNodeWrapper as CreateDiscountCodeNode } from 'pages/automate/workflows/editor/visualBuilder/nodes/CreateDiscountCodeNode'
import { EndNodeWrapper as EndNode } from 'pages/automate/workflows/editor/visualBuilder/nodes/EndNode'
import { HttpRequestNodeWrapper as HttpRequestNode } from 'pages/automate/workflows/editor/visualBuilder/nodes/HttpRequestNode'
import { LiquidTemplateNodeWrapper as LiquidTemplateNode } from 'pages/automate/workflows/editor/visualBuilder/nodes/LiquidTemplateNode'
import { LLMPromptTriggerNodeWrapper as LLMPromptTriggerNode } from 'pages/automate/workflows/editor/visualBuilder/nodes/LLMPromptTriggerNode'
import { RefundOrderNodeWrapper as RefundOrderNode } from 'pages/automate/workflows/editor/visualBuilder/nodes/RefundOrderNode'
import { RefundShippingCostsNodeWrapper as RefundShippingCostsNode } from 'pages/automate/workflows/editor/visualBuilder/nodes/RefundShippingCostsNode'
import { RemoveItemNodeWrapper as RemoveItemNode } from 'pages/automate/workflows/editor/visualBuilder/nodes/RemoveItemNode'
import { ReplaceItemNodeWrapper as ReplaceItemNode } from 'pages/automate/workflows/editor/visualBuilder/nodes/ReplaceItemNode'
import { ReshipForFreeNodeWrapper as ReshipForFreeNode } from 'pages/automate/workflows/editor/visualBuilder/nodes/ReshipForFreeNode'
import { ReusableLLMPromptCallNodeWrapper as ReusableLLMPromptCallNode } from 'pages/automate/workflows/editor/visualBuilder/nodes/ReusableLLMPromptCallNode'
import { ReusableLLMPromptTriggerNodeWrapper as ReusableLLMPromptTriggerNode } from 'pages/automate/workflows/editor/visualBuilder/nodes/ReusableLLMPromptTriggerNode'
import { SkipChargeNodeWrapper as SkipChargeNode } from 'pages/automate/workflows/editor/visualBuilder/nodes/SkipChargeNode'
import { UpdateShippingAddressNodeWrapper as UpdateShippingAddressNode } from 'pages/automate/workflows/editor/visualBuilder/nodes/UpdateShippingAddressNode'
import css from 'pages/automate/workflows/editor/visualBuilder/WorkflowVisualBuilder.less'
import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import type {
    VisualBuilderEdge,
    VisualBuilderNode,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import { EditOrderNoteNodeWrapper as EditOrderNoteNode } from '../../../workflows/editor/visualBuilder/nodes/EditOrderNoteNode'
import { VisualBuilderControls } from './VisualBuilderControls'

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
    edit_order_note: EditOrderNoteNode,
    liquid_template: LiquidTemplateNode,
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
    const { visualBuilderGraph, dispatch } = useVisualBuilderContext()
    const theme = useTheme()

    const [nodes, setNodes, onNodesChange] = useNodesState<VisualBuilderNode>(
        visualBuilderGraph.nodes,
    )
    const [edges, setEdges, onEdgesChange] = useEdgesState<VisualBuilderEdge>(
        visualBuilderGraph.edges,
    )

    useEffect(() => {
        setNodes(visualBuilderGraph.nodes)
    }, [visualBuilderGraph.nodes, setNodes])

    useEffect(() => {
        setEdges(visualBuilderGraph.edges)
    }, [visualBuilderGraph.edges, setEdges])

    const visualBuilderNodeEditing = visualBuilderGraph.nodeEditingId
        ? visualBuilderGraph.nodes.find(
              (n) => n.id === visualBuilderGraph.nodeEditingId,
          )
        : null

    const handleDrawerEditorClose = useCallback(() => {
        dispatch({ type: 'CLOSE_EDITOR' })
    }, [dispatch])

    const handleNodeClick = useCallback<NodeMouseHandler>(
        (_event, node) => {
            dispatch({
                type: 'SET_NODE_EDITING_ID',
                nodeId: node.id,
            })
        },
        [dispatch],
    )
    // for big flows we disable some features to improve performance
    const isDegradedMode = visualBuilderGraph.nodes.length > 800
    const isMiniMapHidden = isMiniMapHiddenProp || isDegradedMode

    return (
        <div className={css.container}>
            <div className={css.reactFlowContainer}>
                <ReactFlowProvider>
                    <ReactFlow
                        colorMode={
                            theme.resolvedName === THEME_NAME.Dark
                                ? 'dark'
                                : 'light'
                        }
                        proOptions={{
                            hideAttribution: true,
                        }}
                        fitView
                        fitViewOptions={{
                            duration: 0,
                        }}
                        onlyRenderVisibleElements
                        nodes={nodes}
                        onNodesChange={onNodesChange}
                        edges={edges}
                        onEdgesChange={onEdgesChange}
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

export { WorkflowVisualBuilder }
