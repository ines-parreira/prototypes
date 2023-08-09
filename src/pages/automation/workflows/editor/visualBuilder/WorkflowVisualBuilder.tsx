import React, {PropsWithChildren, useCallback, useEffect} from 'react'
import {
    ReactFlow,
    Background,
    MiniMap,
    Controls,
    ReactFlowProvider,
} from 'reactflow'
import _keyBy from 'lodash/keyBy'
import {usePrevious} from 'react-use'

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

const nodeTypes = {
    trigger_button: TriggerButtonNode,
    automated_message: AutomatedMessageNode,
    multiple_choices: MultipleChoicesNode,
    text_reply: TextReplyNode,
    file_upload: FileUploadNode,
    order_selection: OrderSelectionNode,
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
    }, [setVisualBuilderNodeIdEditing])

    if (isFetchPending) return <Loader />

    return (
        <>
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
                onNodeClick={(_e, node) => {
                    setVisualBuilderNodeIdEditing(node.id)
                }}
                elementsSelectable={false}
                nodesFocusable={false}
                edgesFocusable={false}
                zoomOnPinch={true}
                zoomOnScroll={false}
                panOnScroll={true}
            >
                <MiniMap zoomable pannable position="top-left" />
                <Controls
                    showInteractive={false}
                    position="top-left"
                    style={{left: 200 + 15}}
                />
                <Background />
            </ReactFlow>
            <NodeEditorDrawer
                nodeInEdition={visualBuilderNodeEditing}
                onClose={onDrawerEditorClose}
            />
        </>
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
