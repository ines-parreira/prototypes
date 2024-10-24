import 'reactflow/dist/style.css'

import classNames from 'classnames'
import React, {Dispatch, PropsWithChildren, useCallback, useMemo} from 'react'
import {
    Controls,
    MiniMap,
    ReactFlow,
    ReactFlowInstance,
    ReactFlowProvider,
    useNodesInitialized,
    useReactFlow,
} from 'reactflow'

import {useSearchParam} from 'hooks/useSearchParam'
import Loader from 'pages/common/components/Loader/Loader'

import {TestFlowEditor} from '../../editor/visualBuilder/editors/TestFlowEditor'
import {withVisualBuilderContext} from '../../hooks/useVisualBuilder'
import {VisualBuilderGraphAction} from '../../hooks/useVisualBuilderGraphReducer'
import {useWorkflowEditorContext} from '../../hooks/useWorkflowEditor'

import {VisualBuilderGraph} from '../../models/visualBuilderGraph.types'
import CustomEdge from './CustomEdge'
import AnalyticsNode from './nodes/AnalyticsNode'
import ChannelTriggerNode from './nodes/ChannelTriggerNode'
import EndNode from './nodes/EndNode'

import css from './WorkflowVisualBuilder.less'

const nodeTypes = {
    channel_trigger: ChannelTriggerNode,
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

type Props = {
    visualBuilderGraph: VisualBuilderGraph
    dispatch: Dispatch<VisualBuilderGraphAction>
}

export const WorkflowVisualBuilderWrapped: React.FC<Props> = () => {
    const {
        isFetchPending,
        visualBuilderGraph,
        isTesting,
        setIsTesting,
        setZoom,
    } = useWorkflowEditorContext()
    const reactFlow = useReactFlow()
    const [searchParams] = useSearchParam('zoom')

    const startFlowNode = useMemo(
        () =>
            visualBuilderGraph.nodes.find((n) => n.type === 'channel_trigger'),
        [visualBuilderGraph.nodes]
    )

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
                    {startFlowNode && (
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

export default withProviders(
    withVisualBuilderContext(WorkflowVisualBuilderWrapped)
)
