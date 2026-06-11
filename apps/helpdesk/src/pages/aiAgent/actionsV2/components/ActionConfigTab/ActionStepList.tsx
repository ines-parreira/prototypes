import type { Dispatch } from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'

import _isEqual from 'lodash/isEqual'

import { Box, Button, Skeleton } from '@gorgias/axiom'

import { useApps } from 'pages/automate/actionsPlatform/hooks/useApps'
import { useGetAppFromTemplateApp } from 'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp'
import type { ActionTemplate } from 'pages/automate/actionsPlatform/types'
import { DefaultExportNodeMenu as NodeMenu } from 'pages/automate/workflows/editor/visualBuilder/components/NodeMenu'
import { NodeEditorDrawer } from 'pages/automate/workflows/editor/visualBuilder/NodeEditorDrawer'
import type { VisualBuilderGraphAction } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import { walkVisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.model'
import type {
    ReusableLLMPromptCallNodeType,
    VisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { isReusableLLMPromptCallNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { Caption } from 'pages/common/forms/Caption/Caption'

import { ActionStepRow } from './ActionStepRow'

import css from './ActionStepList.less'

type Props = {
    graph: VisualBuilderGraph
    dispatch: Dispatch<VisualBuilderGraphAction>
    steps: ActionTemplate[]
    onBuildAdvanced?: () => void
}

export const ActionStepList = ({
    graph,
    dispatch,
    steps,
    onBuildAdvanced,
}: Props) => {
    const [isAddStepOpen, setIsAddStepOpen] = useState(false)
    const [dirtyNodes, setDirtyNodes] = useState<
        ReusableLLMPromptCallNodeType[]
    >([])
    const addStepTargetRef = useRef<HTMLDivElement>(null)

    const { apps } = useApps()
    const getAppFromTemplateApp = useGetAppFromTemplateApp({ apps })

    const orderedNodes = useMemo(() => {
        const nodes: ReusableLLMPromptCallNodeType[] = []

        walkVisualBuilderGraph(graph, graph.nodes[0].id, (node) => {
            if (isReusableLLMPromptCallNodeType(node)) {
                nodes.push(node)
            }
        })

        return nodes
    }, [graph])

    const handleMove = useCallback(
        (dragIndex: number, hoverIndex: number) => {
            const nextDirtyNodes =
                dirtyNodes.length > 0 ? [...dirtyNodes] : orderedNodes.slice()
            const dirtyNode = nextDirtyNodes[dragIndex]

            if (!dirtyNode) {
                return
            }

            nextDirtyNodes.splice(dragIndex, 1)
            nextDirtyNodes.splice(hoverIndex, 0, dirtyNode)

            setDirtyNodes(nextDirtyNodes)
        },
        [dirtyNodes, orderedNodes],
    )

    const handleDrop = useCallback(() => {
        if (dirtyNodes.length === 0) {
            return
        }

        if (!_isEqual(dirtyNodes, orderedNodes)) {
            dispatch({
                type: 'REORDER_REUSABLE_LLM_PROMPT_CALL_NODE',
                nodeIds: dirtyNodes.map((node) => node.id),
            })
        }

        setDirtyNodes([])
    }, [dirtyNodes, orderedNodes, dispatch])

    const handleCancel = useCallback(() => setDirtyNodes([]), [])

    const addStepAnchorNodeId = useMemo(() => {
        let nodeId = graph.nodes[0].id

        walkVisualBuilderGraph(graph, graph.nodes[0].id, (node) => {
            if (node.type === 'end' && node.data.action === 'end-success') {
                nodeId = node.id
            }
        })

        return nodeId
    }, [graph])

    const visualBuilderNodeEditing = graph.nodeEditingId
        ? graph.nodes.find((n) => n.id === graph.nodeEditingId)
        : null

    const onDrawerEditorClose = useCallback(() => {
        dispatch({ type: 'CLOSE_EDITOR' })
    }, [dispatch])

    const displayNodes = dirtyNodes.length > 0 ? dirtyNodes : orderedNodes

    return (
        <>
            <NodeEditorDrawer
                nodeInEdition={visualBuilderNodeEditing}
                onClose={onDrawerEditorClose}
            />
            <Box flexDirection="column" gap="sm">
                <Box flexDirection="column" gap="xs">
                    {displayNodes.map((node, index) => {
                        const step = steps.find(
                            (s) => s.id === node.data.configuration_id,
                        )

                        if (!step) {
                            return <Skeleton key={node.id} height={48} />
                        }

                        const templateApp = step.apps[0]
                        const app = getAppFromTemplateApp(templateApp)

                        if (!app) {
                            return <Skeleton key={node.id} height={48} />
                        }

                        return (
                            <ActionStepRow
                                key={node.id}
                                index={index}
                                app={app}
                                stepName={step.name}
                                onDelete={() =>
                                    dispatch({
                                        type: 'DELETE_NODE',
                                        nodeId: node.id,
                                        steps,
                                        apps,
                                    })
                                }
                                onClick={() =>
                                    dispatch({
                                        type: 'SET_NODE_EDITING_ID',
                                        nodeId: node.id,
                                    })
                                }
                                onMove={handleMove}
                                onDrop={handleDrop}
                                onCancel={handleCancel}
                            />
                        )
                    })}
                </Box>

                <div ref={addStepTargetRef} className={css.addStepWrapper}>
                    <Button
                        variant="tertiary"
                        trailingSlot="arrow-chevron-down"
                        onClick={() => setIsAddStepOpen((prev) => !prev)}
                    >
                        Add step
                    </Button>
                </div>
                <NodeMenu
                    nodeId={addStepAnchorNodeId}
                    target={addStepTargetRef}
                    isOpen={isAddStepOpen}
                    onToggle={setIsAddStepOpen}
                    placement="bottom-start"
                    onBuildAdvanced={onBuildAdvanced}
                />
                {!!graph.errors?.nodes && (
                    <Caption error={graph.errors.nodes} />
                )}
            </Box>
        </>
    )
}
