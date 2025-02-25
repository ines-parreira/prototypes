import 'reactflow/dist/style.css'

import React, { Dispatch, PropsWithChildren, useCallback, useMemo } from 'react'

import classNames from 'classnames'
import {
    ControlButton,
    Controls,
    MiniMap,
    NodeMouseHandler,
    ReactFlow,
    ReactFlowInstance,
    ReactFlowProvider,
    useNodesInitialized,
    useReactFlow,
} from 'reactflow'

import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { gorgiasColors } from 'gorgias-design-system/styles'
import { useSearchParam } from 'hooks/useSearchParam'
import FitViewIcon from 'pages/automate/common/components/FitViewIcon'

import { withVisualBuilderContext } from '../../hooks/useVisualBuilder'
import { VisualBuilderGraphAction } from '../../hooks/useVisualBuilderGraphReducer'
import { useWorkflowEditorContext } from '../../hooks/useWorkflowEditor'
import {
    ChannelTriggerNodeType,
    VisualBuilderGraph,
} from '../../models/visualBuilderGraph.types'
import { VisualBuilderBackground } from './components/VisualBuilderBackground'
import CustomEdge from './CustomEdge'
import { TestFlowEditor } from './editors/TestFlowEditor'
import NodeEditorDrawer from './NodeEditorDrawer'
import AutomatedMessageNode from './nodes/AutomatedMessageNode'
import ChannelTriggerNode from './nodes/ChannelTriggerNode'
import ConditionsNode from './nodes/ConditionsNode'
import EndNode from './nodes/EndNode'
import FileUploadNode from './nodes/FileUploadNode'
import HttpRequestNode from './nodes/HttpRequestNode'
import MultipleChoicesNode from './nodes/MultipleChoicesNode'
import OrderLineItemSelectionNode from './nodes/OrderLineItemSelectionNode'
import OrderSelectionNode from './nodes/OrderSelectionNode'
import ShopperAuthenticationNode from './nodes/ShopperAuthenticationNode'
import TextReplyNode from './nodes/TextReplyNode'
import WorkflowsPublisher from './publisher/WorkflowsPublisher'

import css from './WorkflowVisualBuilder.less'

const nodeTypes = {
    channel_trigger: ChannelTriggerNode,
    automated_message: AutomatedMessageNode,
    conditions: ConditionsNode,
    multiple_choices: MultipleChoicesNode,
    text_reply: TextReplyNode,
    file_upload: FileUploadNode,
    order_selection: OrderSelectionNode,
    http_request: HttpRequestNode,
    shopper_authentication: ShopperAuthenticationNode,
    order_line_item_selection: OrderLineItemSelectionNode,
    end: EndNode,
}

const edgeTypes = {
    custom: CustomEdge,
}

interface Props {
    isNew: boolean
    visualBuilderGraph: VisualBuilderGraph<ChannelTriggerNodeType>
    dispatch: Dispatch<VisualBuilderGraphAction>
}

export function WorkflowVisualBuilderWrapped({ isNew }: Props) {
    const {
        isFetchPending,
        visualBuilderGraph,
        isTesting,
        setIsTesting,
        setZoom,
        dispatch,
    } = useWorkflowEditorContext()
    const reactFlow = useReactFlow()
    const [searchParams] = useSearchParam('zoom')

    const visualBuilderNodeEditing = visualBuilderGraph.nodeEditingId
        ? visualBuilderGraph.nodes.find(
              (n) => n.id === visualBuilderGraph.nodeEditingId,
          )
        : null

    const onDrawerEditorClose = useCallback(() => {
        dispatch({ type: 'CLOSE_EDITOR' })
    }, [dispatch])

    const onDrawerTestEditorClose = useCallback(() => {
        setIsTesting(false)
    }, [setIsTesting])

    const handleNodeClick = useCallback<NodeMouseHandler>(
        (_event, node) => {
            dispatch({
                type: 'SET_NODE_EDITING_ID',
                nodeId: node.id,
            })
        },
        [dispatch],
    )

    const areNodesInitialized = useNodesInitialized()

    // for big flows we disable some features to improve performance
    const isDegradedMode = visualBuilderGraph.nodes.length > 800

    const hasNodeWithShopperAuthentication = useMemo(() => {
        return visualBuilderGraph.nodes.some(
            (n) => n.type === 'shopper_authentication',
        )
    }, [visualBuilderGraph.nodes])

    const reactFlowOnInit = useCallback(
        (instance: ReactFlowInstance) => {
            const zoomLevel = parseFloat(searchParams || '1.1')
            if (zoomLevel >= 0.1 && zoomLevel <= 1) {
                instance.zoomTo(zoomLevel)
            }
        },
        [searchParams],
    )

    const onPanelMove = useCallback(() => {
        const zoomLevel = reactFlow.getZoom()
        setZoom(zoomLevel)
    }, [reactFlow, setZoom])

    const handleFitView = useCallback(() => reactFlow.fitView(), [reactFlow])

    return (
        <div className={css.container}>
            {(isFetchPending || !areNodesInitialized) && (
                <div className={css.spinner}>
                    <LoadingSpinner size="big" />
                </div>
            )}
            {!isFetchPending && (
                <>
                    <div
                        className={classNames(css.reactFlowContainer, {
                            [css.transparent]:
                                isFetchPending || !areNodesInitialized,
                        })}
                    >
                        <ReactFlow
                            onInit={reactFlowOnInit}
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
                            onMove={onPanelMove}
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
                                style={
                                    !isDegradedMode ? { left: 200 + 15 } : {}
                                }
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
                    </div>
                    <NodeEditorDrawer
                        nodeInEdition={visualBuilderNodeEditing}
                        onClose={onDrawerEditorClose}
                    />
                    {!isNew && (
                        <TestFlowEditor
                            startFlowNode={visualBuilderGraph.nodes[0]}
                            isAuthenticationBannerVisible={
                                hasNodeWithShopperAuthentication
                            }
                            isTesting={isTesting}
                            onClose={onDrawerTestEditorClose}
                        />
                    )}
                    <WorkflowsPublisher />
                </>
            )}
        </div>
    )
}

function withProviders<T>(Component: React.FC<T>): React.FC<T> {
    return (props: PropsWithChildren<T>) => (
        <ReactFlowProvider>
            <Component {...props} />
        </ReactFlowProvider>
    )
}

export default withProviders(
    withVisualBuilderContext(WorkflowVisualBuilderWrapped),
)
