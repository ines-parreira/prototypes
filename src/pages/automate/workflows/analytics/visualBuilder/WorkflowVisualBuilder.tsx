import 'reactflow/dist/style.css'

import React, {PropsWithChildren, useCallback, useEffect, useMemo} from 'react'
import {
    Controls,
    MiniMap,
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
import {TestFlowEditor} from '../../editor/visualBuilder/editors/TestFlowEditor'

import TriggerButtonNode from './nodes/TriggerButtonNode'
import EndNode from './nodes/EndNode'

import CustomEdge from './CustomEdge'

import css from './WorkflowVisualBuilder.less'
import AnalyticsNode from './nodes/AnalyticsNode'

const nodeTypes = {
    trigger_button: TriggerButtonNode,
    automated_message: AnalyticsNode,
    conditions: AnalyticsNode,
    multiple_choices: AnalyticsNode,
    text_reply: AnalyticsNode,
    file_upload: AnalyticsNode,
    order_selection: AnalyticsNode,
    http_request: AnalyticsNode,
    shopper_authentication: AnalyticsNode,
    order_line_item_selection: AnalyticsNode,
    end: EndNode,
}

const edgeTypes = {
    custom: CustomEdge,
}

export function WorkflowVisualBuilderWrapped() {
    const {
        isFetchPending,
        visualBuilderGraph,
        visualBuilderNodeIdEditing,
        isTesting,
        setVisualBuilderNodeIdEditing,
        setIsTesting,
        setZoom,
    } = useWorkflowEditorContext()
    const reactFlow = useReactFlow()
    const [searchParams] = useSearchParam('zoom')

    const isPreviewDrawerVisible =
        useFlags()[FeatureFlagKey.FlowsPreviewTestButton]

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

    const onDrawerTestEditorClose = useCallback(() => {
        setIsTesting(false)
    }, [setIsTesting])

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
                        </ReactFlow>
                    </div>
                    {startFlowNode && isPreviewDrawerVisible && (
                        <TestFlowEditor
                            startFlowNode={startFlowNode}
                            isAuthenticationBannerVisible={
                                hasNodeWithShopperAuthentication
                            }
                            isTesting={isTesting}
                            onClose={onDrawerTestEditorClose}
                        />
                    )}
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
