import React, { Dispatch, useCallback, useMemo, useRef, useState } from 'react'

import { Node } from '@xyflow/react'
import _isEqual from 'lodash/isEqual'

import { LegacyButton as Button, Label, Skeleton } from '@gorgias/axiom'

import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import useGetAppFromTemplateApp from 'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp'
import { ActionTemplate } from 'pages/automate/actionsPlatform/types'
import {
    getActionsAppFromTemplateApp,
    getGraphAppFromTemplateApp,
} from 'pages/automate/actionsPlatform/utils'
import NodeMenu from 'pages/automate/workflows/editor/visualBuilder/components/NodeMenu'
import NodeEditorDrawer from 'pages/automate/workflows/editor/visualBuilder/NodeEditorDrawer'
import { VisualBuilderGraphAction } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import {
    getReusableLLMPromptCallNodeStatuses,
    walkVisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {
    isReusableLLMPromptCallNodeType,
    ReusableLLMPromptCallNodeType,
    VisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import { Separator } from 'pages/common/components/Separator/Separator'
import Caption from 'pages/common/forms/Caption/Caption'

import { useStoreTrackstarContext } from '../providers/StoreTrackstarContext'
import { StepListItem, StepListItemProps } from './StepListItem'

import css from './SimplifiedStepBuilderSteps.less'

type Props = {
    graph: VisualBuilderGraph
    dispatch: Dispatch<VisualBuilderGraphAction>
    steps: ActionTemplate[]
}

export const SimplifiedStepBuilderSteps = ({
    graph,
    dispatch,
    steps,
}: Props) => {
    const [isStepDropdownOpen, setIsStepDropdownOpen] = useState(false)
    const [dirtyNodes, setDirtyNodes] = useState<
        ReusableLLMPromptCallNodeType[]
    >([])
    const dropdownTargetRef = useRef<HTMLButtonElement>(null)

    const { apps, actionsApps } = useApps()
    const getAppFromTemplateApp = useGetAppFromTemplateApp({ apps })
    const { connections } = useStoreTrackstarContext()
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

    const handleNodeClick = useCallback(
        (node: Node) => {
            dispatch({
                type: 'SET_NODE_EDITING_ID',
                nodeId: node.id,
            })
        },
        [dispatch],
    )

    const nodeId = useMemo(() => {
        let nodeId = graph.nodes[0].id

        walkVisualBuilderGraph(graph, graph.nodes[0].id, (node) => {
            if (node.type === 'end' && node.data.action === 'end-success') {
                nodeId = node.id
            }
        })

        return nodeId
    }, [graph])

    const displayNodesProps = useMemo<
        ((StepListItemProps & { id: string }) | null)[]
    >(() => {
        return (dirtyNodes.length ? dirtyNodes : orderedNodes).map(
            (node, index) => {
                const step = steps.find(
                    (step) => step.id === node.data.configuration_id,
                )

                if (!step) {
                    return null
                }

                const templateApp = step.apps[0]
                const app = getAppFromTemplateApp(templateApp)

                if (!app) {
                    return null
                }

                const graphApp = getGraphAppFromTemplateApp(
                    graph.apps ?? [],
                    templateApp,
                )
                const actionsApp = getActionsAppFromTemplateApp(
                    actionsApps,
                    templateApp,
                )

                const trackstarConnection =
                    actionsApp?.auth_type === 'trackstar'
                        ? connections[actionsApp.auth_settings.integration_name]
                        : undefined
                const {
                    isClickable,
                    hasMissingCredentials,
                    hasCredentials,
                    hasAllValues,
                    hasMissingValues,
                    hasInvalidCredentials,
                } = getReusableLLMPromptCallNodeStatuses({
                    graphApp,
                    actionsApp,
                    step,
                    values: node.data.values,
                    templateApp,
                    isTemplate: graph.isTemplate,
                    trackstarConnection,
                })

                return {
                    id: node.id,
                    index,
                    step,
                    onDelete: () => {
                        dispatch({
                            type: 'DELETE_NODE',
                            nodeId: node.id,
                            steps,
                            apps,
                        })
                    },
                    onClick: () => handleNodeClick(node),
                    app,
                    onMove: handleMove,
                    onDrop: handleDrop,
                    onCancel: () => setDirtyNodes([]),
                    isClickable,
                    hasMissingCredentials,
                    hasCredentials,
                    hasAllValues,
                    hasMissingValues,
                    hasInvalidCredentials,
                }
            },
        )
    }, [
        dirtyNodes,
        orderedNodes,
        steps,
        actionsApps,
        apps,
        getAppFromTemplateApp,
        graph,
        dispatch,
        handleNodeClick,
        handleMove,
        handleDrop,
        setDirtyNodes,
        connections,
    ])

    const hasMissingValues = displayNodesProps.some(
        (props) => props && props.hasMissingValues,
    )
    const hasMissingCredentials = displayNodesProps.some(
        (props) => props && props.hasMissingCredentials,
    )
    const stepsWithInvalidCredentials = displayNodesProps.filter(
        (
            props,
        ): props is Exclude<
            StepListItemProps & { id: string },
            null | { app?: null }
        > => !!props && props.hasInvalidCredentials && !!props.app,
    )

    const visualBuilderNodeEditing = graph.nodeEditingId
        ? graph.nodes.find((n) => n.id === graph.nodeEditingId)
        : null

    const onDrawerEditorClose = useCallback(() => {
        dispatch({ type: 'CLOSE_EDITOR' })
    }, [dispatch])

    return (
        <>
            <NodeEditorDrawer
                nodeInEdition={visualBuilderNodeEditing}
                onClose={onDrawerEditorClose}
            />
            <div>
                <Label isRequired className={css.label}>
                    Action steps
                </Label>
                <span className={css.description}>
                    Add one or more steps with your 3rd party apps. Steps will
                    be performed in the order below.
                </span>
                {(hasMissingValues || hasMissingCredentials) && (
                    <Alert type={AlertType.Warning} icon className={css.alert}>
                        {hasMissingCredentials && hasMissingValues
                            ? 'Provide values and authentication for steps below to save this Action.'
                            : hasMissingCredentials
                              ? 'Provide authentication for steps below to save this Action.'
                              : 'Provide values for steps below to save this Action.'}
                    </Alert>
                )}
                {stepsWithInvalidCredentials.map((step) => (
                    <Alert
                        type={AlertType.Warning}
                        icon
                        className={css.alert}
                        key={step.id}
                    >
                        We lost connection with {step.app.name}. Reconnect to
                        avoid disruptions with Action performance.
                    </Alert>
                ))}

                <ul className={css.stepList}>
                    {displayNodesProps.map((props, index) => {
                        return (
                            <React.Fragment key={props ? props.id : index}>
                                {props ? (
                                    <StepListItem {...props} />
                                ) : (
                                    <Skeleton height={32} />
                                )}
                                {index !== displayNodesProps.length - 1 && (
                                    <Separator />
                                )}
                            </React.Fragment>
                        )
                    })}
                </ul>
                <Button
                    intent="secondary"
                    ref={dropdownTargetRef}
                    trailingIcon="arrow_drop_down"
                    onClick={() => {
                        setIsStepDropdownOpen((prev) => !prev)
                    }}
                >
                    Add Step
                </Button>
                <NodeMenu
                    nodeId={nodeId}
                    target={dropdownTargetRef}
                    isOpen={isStepDropdownOpen}
                    onToggle={setIsStepDropdownOpen}
                    placement="bottom-start"
                />
                {!!graph.errors?.nodes && (
                    <Caption error={graph.errors.nodes} />
                )}
            </div>
        </>
    )
}
