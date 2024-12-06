import 'reactflow/dist/style.css'

import {LoadingSpinner} from '@gorgias/merchant-ui-kit'
import classnames from 'classnames'
import React, {Dispatch, PropsWithChildren, useCallback, FC} from 'react'
import {
    ControlButton,
    Controls,
    MiniMap,
    NodeMouseHandler,
    ReactFlow,
    ReactFlowProvider,
    useNodesInitialized,
    useReactFlow,
} from 'reactflow'

import {gorgiasColors} from 'gorgias-design-system/styles'
import FitViewIcon from 'pages/automate/common/components/FitViewIcon'
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
import ReusableLLMPromptTriggerNode from 'pages/automate/workflows/editor/visualBuilder/nodes/ReusableLLMPromptTriggerNode'
import SkipChargeNode from 'pages/automate/workflows/editor/visualBuilder/nodes/SkipChargeNode'
import UpdateShippingAddressNode from 'pages/automate/workflows/editor/visualBuilder/nodes/UpdateShippingAddressNode'

import css from 'pages/automate/workflows/editor/visualBuilder/WorkflowVisualBuilder.less'
import {withVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {VisualBuilderGraphAction} from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import {VisualBuilderGraph} from 'pages/automate/workflows/models/visualBuilderGraph.types'

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

    const reactFlow = useReactFlow()
    const handleFitView = useCallback(() => reactFlow.fitView(), [reactFlow])

    return (
        <div className={css.container}>
            {!areNodesInitialized && <LoadingSpinner size="big" />}
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
                            maskColor={gorgiasColors.neutralGrey0}
                            nodeColor={gorgiasColors.neutralGrey3}
                        />
                    )}
                    <Controls
                        className={css.controls}
                        showFitView={false}
                        showInteractive={false}
                        position="top-left"
                        style={!isDegradedMode ? {left: 200 + 15} : {}}
                    >
                        <ControlButton onClick={handleFitView}>
                            <FitViewIcon />
                        </ControlButton>
                    </Controls>
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
