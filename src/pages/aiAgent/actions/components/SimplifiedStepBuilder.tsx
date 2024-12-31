import {Label} from '@gorgias/merchant-ui-kit'
import _ from 'lodash'
import isEqual from 'lodash/isEqual'
import React, {useState, useRef, useMemo, Dispatch, useCallback} from 'react'

import {Node} from 'reactflow'

import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import {ActionTemplate} from 'pages/automate/actionsPlatform/types'
import {useMenuItems} from 'pages/automate/workflows/editor/visualBuilder/components/EdgeBlock'
import NodeEditorDrawer from 'pages/automate/workflows/editor/visualBuilder/NodeEditorDrawer'
import {VisualBuilderGraphAction} from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import {walkVisualBuilderGraph} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {
    ReusableLLMPromptCallNodeType,
    VisualBuilderGraph,
    isReusableLLMPromptCallNodeType,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Dropdown from 'pages/common/components/dropdown/Dropdown'

import Caption from 'pages/common/forms/Caption/Caption'

import {getCredentialsStatus} from '../utils'
import {ConvertActionToAdvancedViewDialog} from './ConvertActionToAdvancedViewDialog'
import css from './SimplifiedStepBuilder.less'
import {StepListItem} from './StepListItem'

export const SimplifiedStepBuilder = ({
    graph,
    dispatch,
    steps,
}: {
    graph: VisualBuilderGraph
    dispatch: Dispatch<VisualBuilderGraphAction>
    steps: ActionTemplate[]
}) => {
    const nodes = graph.nodes.filter(isReusableLLMPromptCallNodeType)
    const [isAppSelectorDropdownOpen, setIsAppSelectorDropdownOpen] =
        useState(false)
    const [dirtyNodes, setDirtyNodes] = useState<
        ReusableLLMPromptCallNodeType[]
    >([])
    const dropdownTargetRef = useRef<HTMLButtonElement>(null)
    const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false)

    const {apps, actionsApps} = useApps()

    const filteredApps = useMemo(() => {
        const stepsByApp = _.groupBy(steps, (step) => {
            switch (step.apps[0].type) {
                case 'shopify':
                case 'recharge':
                    return step.apps[0].type
                case 'app':
                    return step.apps[0].app_id
            }
        })

        return apps.filter(
            (app) =>
                (app.type !== 'app' ||
                    actionsApps.some((actionApp) => actionApp.id === app.id)) &&
                // Only show apps that have steps
                stepsByApp[app.id]?.length > 0
        )
    }, [apps, actionsApps, steps])

    const orderedNodes = useMemo(() => {
        if (nodes.length === 0) return []
        const result: ReusableLLMPromptCallNodeType[] = []
        walkVisualBuilderGraph(graph, nodes[0].id, (node) => {
            if (isReusableLLMPromptCallNodeType(node)) {
                result.push(node)
            }
        })
        return result
    }, [graph, nodes])
    const {hasMissingValues, hasMissingCredentials} = useMemo(() => {
        let hasMissingValues = false
        let hasMissingCredentials = false

        for (const node of orderedNodes) {
            const step = steps.find((s) => s.id === node.data.configuration_id)
            if (!step) continue

            const templateApp = step?.apps?.[0]
            const hasInputs = !!step?.inputs?.length
            if (
                hasInputs &&
                (step.inputs?.length ?? 0) !==
                    Object.keys(node.data.values).length
            ) {
                hasMissingValues = true
            }

            const graphApp = graph.apps?.find((app) => {
                switch (templateApp?.type) {
                    case 'shopify':
                    case 'recharge':
                        return app.type === templateApp.type
                    case 'app':
                        return (
                            app.type === 'app' &&
                            app.app_id === templateApp.app_id
                        )
                }
            })

            const {hasMissingCredentials: missingCredentials} =
                getCredentialsStatus(graphApp, templateApp, graph.isTemplate)

            if (missingCredentials) {
                hasMissingCredentials = true
            }

            if (hasMissingValues && hasMissingCredentials) {
                break
            }
        }

        return {hasMissingValues, hasMissingCredentials}
    }, [orderedNodes, steps, graph.apps, graph.isTemplate])

    const handleMove = (dragIndex: number, hoverIndex: number) => {
        const nextDirtyNodes =
            dirtyNodes.length > 0 ? [...dirtyNodes] : orderedNodes.slice()
        const dirtyNode = nextDirtyNodes[dragIndex]

        if (!dirtyNode) {
            return
        }

        // Move the node
        nextDirtyNodes.splice(dragIndex, 1)
        nextDirtyNodes.splice(hoverIndex, 0, dirtyNode)

        setDirtyNodes(nextDirtyNodes)
    }

    const handleDrop = useCallback(() => {
        if (dirtyNodes.length === 0) return
        if (!isEqual(dirtyNodes, orderedNodes)) {
            dispatch({
                type: 'REUSABLE_LLM_PROMPT_CALL_NODE',
                nodeIds: dirtyNodes.map((node) => node.id),
            })
        }
        setDirtyNodes([])
    }, [dirtyNodes, orderedNodes, dispatch])

    const visualBuilderNodeEditing = graph.nodeEditingId
        ? graph.nodes.find((n) => n.id === graph.nodeEditingId)
        : null

    const onDrawerEditorClose = useCallback(() => {
        dispatch({type: 'CLOSE_EDITOR'})
    }, [dispatch])

    const handleNodeClick = useCallback(
        (node: Node) => {
            dispatch({
                type: 'SET_NODE_EDITING_ID',
                nodeId: node.id,
            })
        },
        [dispatch]
    )

    const menuItems = useMenuItems(
        graph.nodes
            .filter(
                (node) =>
                    node.type === 'end' && node.data.action === 'end-success'
            )
            .slice(-1)?.[0]?.id
    )

    return (
        <>
            <div>
                <NodeEditorDrawer
                    nodeInEdition={visualBuilderNodeEditing}
                    onClose={onDrawerEditorClose}
                />
                <Label isRequired>Action steps</Label>
                <span className={css.description}>
                    Add one or more steps with your 3rd party apps. Steps will
                    be performed in the order below.{' '}
                </span>
                {(hasMissingValues || hasMissingCredentials) && (
                    <Alert
                        type={AlertType.Warning}
                        icon
                        className={css.missingValuesAlert}
                    >
                        {hasMissingCredentials && hasMissingValues
                            ? 'Provide values and authentication for steps below to save this Action.'
                            : hasMissingCredentials
                              ? 'Provide authentication for steps below to save this Action.'
                              : 'Provide values for steps below to save this Action.'}
                    </Alert>
                )}
                <ul className={css.stepList}>
                    {(dirtyNodes.length ? dirtyNodes : orderedNodes).map(
                        (node, index) => {
                            const step = steps.find(
                                (s) => s.id === node.data.configuration_id
                            )
                            if (!step) return null

                            return (
                                <StepListItem
                                    key={node.id}
                                    step={step}
                                    onDelete={() => {
                                        dispatch({
                                            type: 'DELETE_NODE',
                                            nodeId: node.id,
                                            steps,
                                            apps,
                                        })
                                    }}
                                    onClick={() => handleNodeClick(node)}
                                    onMove={handleMove}
                                    onDrop={handleDrop}
                                    onCancel={() => setDirtyNodes([])}
                                    index={index}
                                    nodeValues={node.data.values}
                                    apps={filteredApps}
                                    graphApps={graph.apps ?? []}
                                    isTemplate={graph.isTemplate}
                                />
                            )
                        }
                    )}
                </ul>
                <Button
                    intent="secondary"
                    ref={dropdownTargetRef}
                    trailingIcon="arrow_drop_down"
                    onClick={() =>
                        setIsAppSelectorDropdownOpen((prev) => !prev)
                    }
                >
                    Add Step{' '}
                </Button>
                <Dropdown
                    target={dropdownTargetRef}
                    isOpen={isAppSelectorDropdownOpen}
                    onToggle={(isOpen) => {
                        setIsAppSelectorDropdownOpen(isOpen)
                    }}
                    className={css.dropdown}
                    placement="bottom-start"
                >
                    {menuItems}
                </Dropdown>
                {!!graph.errors?.nodes && (
                    <Caption error={graph.errors.nodes} />
                )}
                <div className={css.dontSeeApp}>
                    <span>Don't see the app you need?</span>
                    <div className={css.dontSeeAppButtons}>
                        <div data-candu-id="step-builder-request-app-button" />
                        <Button
                            fillStyle="ghost"
                            intent="primary"
                            size="small"
                            className={css.button}
                            onClick={() => setIsAdvancedModalOpen(true)}
                        >
                            <ButtonIconLabel icon="settings" position="left" />
                            Advanced options
                        </Button>
                    </div>
                </div>
            </div>
            <ConvertActionToAdvancedViewDialog
                open={isAdvancedModalOpen}
                onClose={() => setIsAdvancedModalOpen(false)}
                onConvert={() => {
                    dispatch({
                        type: 'MIGRATE_TO_ADVANCED_STEP_BUILDER',
                    })
                    setIsAdvancedModalOpen(false)
                }}
            />
        </>
    )
}
