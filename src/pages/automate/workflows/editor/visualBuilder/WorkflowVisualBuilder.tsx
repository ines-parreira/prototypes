import React, {PropsWithChildren, useCallback, useEffect} from 'react'
import {
    ReactFlow,
    MiniMap,
    Controls,
    ReactFlowProvider,
    NodeMouseHandler,
    useNodesInitialized,
} from 'reactflow'
import _keyBy from 'lodash/keyBy'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {usePrevious} from 'react-use'
import classNames from 'classnames'

import Loader from 'pages/common/components/Loader/Loader'
import {useWorkflowEditorContext} from '../../hooks/useWorkflowEditor'
import TriggerButtonNode from './nodes/TriggerButtonNode'
import AutomatedMessageNode from './nodes/AutomatedMessageNode'
import MultipleChoicesNode from './nodes/MultipleChoicesNode'
import EndNode from './nodes/EndNode'
import CustomEdge from './CustomEdge'
import NodeEditorDrawer from './NodeEditorDrawer'

import 'reactflow/dist/style.css'
import TextReplyNode from './nodes/TextReplyNode'
import FileUploadNode from './nodes/FileUploadNode'
import OrderSelectionNode from './nodes/OrderSelectionNode'
import HttpRequestNode from './nodes/HttpRequestNode'

import css from './WorkflowVisualBuilder.less'
import {VisualBuilderBackground} from './components/VisualBuilderBackground'

const nodeTypes = {
    trigger_button: TriggerButtonNode,
    automated_message: AutomatedMessageNode,
    multiple_choices: MultipleChoicesNode,
    text_reply: TextReplyNode,
    file_upload: FileUploadNode,
    order_selection: OrderSelectionNode,
    http_request: HttpRequestNode,
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
        setVisualBuilderNodeIdEditing,
        setVisualBuilderChoiceEventIdEditing,
    } = useWorkflowEditorContext()
    const visualBuilderNodeEditing = visualBuilderNodeIdEditing
        ? visualBuilderGraph.nodes.find(
              (n) => n.id === visualBuilderNodeIdEditing
          )
        : null

    const visualBuilderGraphPrevious = usePrevious(visualBuilderGraph)

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
    }, [setVisualBuilderNodeIdEditing, setVisualBuilderChoiceEventIdEditing])

    const handleNodeClick = useCallback<NodeMouseHandler>(
        (_e, node) => {
            setVisualBuilderNodeIdEditing(node.id)
        },
        [setVisualBuilderNodeIdEditing]
    )

    const areNodesInitialized = useNodesInitialized()

    // for big flows we disable some features to improve performance
    const isDegradedMode = visualBuilderGraph.nodes.length > 800

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
                        onClose={onDrawerEditorClose}
                    />
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
