import 'reactflow/dist/style.css'

import React, {PropsWithChildren, useCallback, useEffect, useMemo} from 'react'
import {
    Controls,
    MiniMap,
    NodeMouseHandler,
    ReactFlow,
    ReactFlowInstance,
    ReactFlowProvider,
    useNodesInitialized,
    useReactFlow,
} from 'reactflow'
import _keyBy from 'lodash/keyBy'
import classNames from 'classnames'

import {useFlags} from 'launchdarkly-react-client-sdk'
import Loader from 'pages/common/components/Loader/Loader'
import usePrevious from 'hooks/usePrevious'

import {FeatureFlagKey} from 'config/featureFlags'
import {useSearchParam} from 'hooks/useSearchParam'
import {useWorkflowEditorContext} from '../../hooks/useWorkflowEditor'
import {VisualBuilderBackground} from './components/VisualBuilderBackground'

import TriggerButtonNode from './nodes/TriggerButtonNode'
import AutomatedMessageNode from './nodes/AutomatedMessageNode'
import MultipleChoicesNode from './nodes/MultipleChoicesNode'
import EndNode from './nodes/EndNode'
import TextReplyNode from './nodes/TextReplyNode'
import FileUploadNode from './nodes/FileUploadNode'
import OrderSelectionNode from './nodes/OrderSelectionNode'
import HttpRequestNode from './nodes/HttpRequestNode'
import ShopperAuthenticationNode from './nodes/ShopperAuthenticationNode'
import ConditionsNode from './nodes/ConditionsNode'
import OrderLineItemSelectionNode from './nodes/OrderLineItemSelectionNode'

import CustomEdge from './CustomEdge'
import NodeEditorDrawer from './NodeEditorDrawer'

import css from './WorkflowVisualBuilder.less'
import {TestFlowEditor} from './editors/TestFlowEditor'
import WorkflowsPublisher from './publisher/WorkflowsPublisher'

const nodeTypes = {
    trigger_button: TriggerButtonNode,
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
    isNewWorkflow: boolean
}

export function WorkflowVisualBuilderWrapped({isNewWorkflow}: Props) {
    const {
        isFetchPending,
        visualBuilderGraph,
        visualBuilderNodeIdEditing,
        isTesting,
        setVisualBuilderNodeIdEditing,
        setVisualBuilderChoiceEventIdEditing,
        setVisualBuilderBranchIdsEditing,
        setIsTesting,
        setZoom,
    } = useWorkflowEditorContext()
    const reactFlow = useReactFlow()
    const [searchParams] = useSearchParam('zoom')

    const isPreviewDrawerVisible =
        useFlags()[FeatureFlagKey.FlowsPreviewTestButton]

    const visualBuilderNodeEditing = visualBuilderNodeIdEditing
        ? visualBuilderGraph.nodes.find(
              (n) => n.id === visualBuilderNodeIdEditing
          )
        : null

    const visualBuilderGraphPrevious = usePrevious(visualBuilderGraph)

    const startFlowNode = useMemo(
        () => visualBuilderGraph.nodes.find((n) => n.type === 'trigger_button'),
        [visualBuilderGraph.nodes]
    )

    useEffect(() => {
        if (!visualBuilderNodeIdEditing || !visualBuilderGraphPrevious?.nodes) {
            return
        }
        const existingNodes = _keyBy(visualBuilderGraphPrevious.nodes, 'id')
        const addedNode = visualBuilderGraph.nodes.find(
            (node) => !(node.id in existingNodes)
        )
        if (addedNode && addedNode.type !== 'end') {
            setVisualBuilderNodeIdEditing(addedNode.id)
        }
    }, [
        visualBuilderGraphPrevious?.nodes,
        visualBuilderGraph?.nodes,
        visualBuilderNodeIdEditing,
        setVisualBuilderNodeIdEditing,
    ])

    const onDrawerEditorClose = useCallback(() => {
        setVisualBuilderNodeIdEditing(null)
        setVisualBuilderChoiceEventIdEditing(null)
        setVisualBuilderBranchIdsEditing([])
    }, [
        setVisualBuilderNodeIdEditing,
        setVisualBuilderChoiceEventIdEditing,
        setVisualBuilderBranchIdsEditing,
    ])

    const onDrawerTestEditorClose = useCallback(() => {
        setIsTesting(false)
    }, [setIsTesting])

    const handleNodeClick = useCallback<NodeMouseHandler>(
        (_e, node) => {
            setVisualBuilderNodeIdEditing(node.id)
        },
        [setVisualBuilderNodeIdEditing]
    )

    const areNodesInitialized = useNodesInitialized()

    // for big flows we disable some features to improve performance
    const isDegradedMode = visualBuilderGraph.nodes.length > 800

    const hasNodeWithShopperAuthentication = useMemo(() => {
        return visualBuilderGraph.nodes.some(
            (n) => n.type === 'shopper_authentication'
        )
    }, [visualBuilderGraph.nodes])

    const reactFlowOnInit = useCallback(
        (instance: ReactFlowInstance) => {
            const zoomLevel = parseFloat(searchParams || '1.1')
            if (zoomLevel >= 0.1 && zoomLevel <= 1) {
                instance.zoomTo(zoomLevel)
            }
        },
        [searchParams]
    )

    const onPanelMove = useCallback(() => {
        const zoomLevel = reactFlow.getZoom()
        setZoom(zoomLevel)
    }, [reactFlow, setZoom])

    return (
        <div className={css.container}>
            {(isFetchPending || !areNodesInitialized) && <Loader />}
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
                        onClose={onDrawerEditorClose}
                    />
                    {startFlowNode &&
                        isPreviewDrawerVisible &&
                        !isNewWorkflow && (
                            <TestFlowEditor
                                startFlowNode={startFlowNode}
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

export default withProviders(WorkflowVisualBuilderWrapped)
