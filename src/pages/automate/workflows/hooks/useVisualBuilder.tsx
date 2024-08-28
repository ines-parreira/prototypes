import React, {
    createContext,
    Dispatch,
    useCallback,
    useContext,
    useMemo,
} from 'react'
import _noop from 'lodash/noop'

import {
    VisualBuilderGraph,
    VisualBuilderNode,
} from '../models/visualBuilderGraph.types'
import {WorkflowVariable} from '../models/variables.types'
import {walkVisualBuilderGraph} from '../models/visualBuilderGraph.model'
import {
    buildWorkflowVariableFromNode,
    extractVariablesFromNode,
    findManyVariables,
    findVariable,
    getWorkflowVariableListForNode,
    parseWorkflowVariable,
} from '../models/variables.model'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from '../models/workflowConfiguration.model'
import {validateConditionSteps} from './useWorkflowEditor'
import {VisualBuilderGraphAction} from './useVisualBuilderGraphReducer'

export type VisualBuilderContext = {
    visualBuilderGraph: VisualBuilderGraph
    checkInvalidConditionsForNode: (
        node: UnionPick<VisualBuilderNode, 'id' | 'type' | 'data'>
    ) => boolean
    checkInvalidVariablesForNode: (
        node: UnionPick<VisualBuilderNode, 'id' | 'type' | 'data'>
    ) => boolean
    checkNodeHasVariablesUsedInChildren: (nodeId: string) => boolean
    dispatch: Dispatch<VisualBuilderGraphAction>
    getVariableListInChildren: (nodeId: string) => WorkflowVariable[]
    checkNewVisualBuilderNode: (nodeId: string) => boolean
    shouldShowErrors: boolean
}

export const VisualBuilderContext = createContext<
    VisualBuilderContext | undefined
>(undefined)

export function useVisualBuilderContext() {
    const contextValue = useContext(VisualBuilderContext)

    if (!contextValue) {
        throw new Error('Visual builder context is undefined,')
    }

    return contextValue
}

export const withVisualBuilderContext =
    <
        WrappedProps extends JSX.IntrinsicAttributes & {
            visualBuilderGraph: VisualBuilderGraph
            dispatch: Dispatch<VisualBuilderGraphAction>
            shouldShowErrors: boolean
        }
    >(
        Component: React.FC<WrappedProps>
    ) =>
    (props: WrappedProps) => {
        const contextValue = useVisualBuilder(
            props.visualBuilderGraph,
            props.dispatch,
            props.shouldShowErrors
        )

        return (
            <VisualBuilderContext.Provider value={contextValue}>
                <Component {...props} />
            </VisualBuilderContext.Provider>
        )
    }

export function useVisualBuilder(
    visualBuilderGraph: VisualBuilderGraph,
    dispatch: Dispatch<VisualBuilderGraphAction>,
    shouldShowErrors: boolean
): VisualBuilderContext {
    const checkInvalidVariablesForNode = useCallback(
        (node: UnionPick<VisualBuilderNode, 'id' | 'type' | 'data'>) => {
            const variables = extractVariablesFromNode(node)

            if (!variables.length) {
                return false
            }

            const availableVariables = getWorkflowVariableListForNode(
                visualBuilderGraph,
                node.id
            )

            return variables
                .map((variable) =>
                    parseWorkflowVariable(variable, availableVariables)
                )
                .some((v) => v === null)
        },
        [visualBuilderGraph]
    )

    const checkInvalidConditionsForNode = useCallback(
        (node: UnionPick<VisualBuilderNode, 'id' | 'type' | 'data'>) => {
            const conditions = visualBuilderGraph.edges
                .filter(
                    (edge) => edge.source === node.id && edge.data?.conditions
                )
                .map((edge) => ({
                    conditions: edge?.data?.conditions?.and
                        ? edge?.data.conditions?.and
                        : edge.data?.conditions?.or ?? [],
                    name: edge.data?.name,
                }))

            return validateConditionSteps(conditions)
        },
        [visualBuilderGraph]
    )

    const getVariableListInChildren = useCallback(
        (nodeId: string) => {
            const node = visualBuilderGraph.nodes.find((n) => n.id === nodeId)

            if (!node) {
                return []
            }

            const nodeVariable = buildWorkflowVariableFromNode(node)

            if (!nodeVariable) {
                return []
            }

            const availableVariables: WorkflowVariable[] = []

            walkVisualBuilderGraph(visualBuilderGraph, nodeId, (childNode) => {
                const variables = extractVariablesFromNode(
                    childNode,
                    visualBuilderGraph.edges
                )

                if (variables.length === 0) return

                availableVariables.push(
                    ...findManyVariables(
                        Array.isArray(nodeVariable)
                            ? nodeVariable
                            : [nodeVariable],
                        (v) => {
                            if ('value' in v && variables.includes(v.value)) {
                                return v
                            }
                        }
                    )
                )
            })

            return availableVariables
        },
        [visualBuilderGraph]
    )

    const checkNodeHasVariablesUsedInChildren = useCallback(
        (nodeId: string) => {
            const node = visualBuilderGraph.nodes.find((n) => n.id === nodeId)

            if (!node) {
                return false
            }

            const nodeVariable = buildWorkflowVariableFromNode(node)

            if (!nodeVariable) {
                return false
            }

            let found = false

            walkVisualBuilderGraph(visualBuilderGraph, nodeId, (childNode) => {
                if (found) {
                    return
                }

                const variables = extractVariablesFromNode(childNode)

                if (!variables.length) {
                    return
                }

                found = Boolean(
                    findVariable(
                        Array.isArray(nodeVariable)
                            ? nodeVariable
                            : [nodeVariable],
                        (v) => {
                            if ('value' in v && variables.includes(v.value)) {
                                return v
                            }
                        }
                    )
                )
            })

            return found
        },
        [visualBuilderGraph]
    )

    const checkNewVisualBuilderNode = useCallback(
        (nodeId: string) => {
            if (!visualBuilderGraph.wfConfigurationOriginal.updated_datetime) {
                return true
            }

            const graph = transformWorkflowConfigurationIntoVisualBuilderGraph(
                visualBuilderGraph.wfConfigurationOriginal
            )

            return !graph.nodes.some((node) => node.id === nodeId)
        },
        [visualBuilderGraph.wfConfigurationOriginal]
    )

    return useMemo<VisualBuilderContext>(
        () => ({
            visualBuilderGraph,
            checkInvalidConditionsForNode,
            checkInvalidVariablesForNode,
            checkNodeHasVariablesUsedInChildren,
            dispatch,
            getVariableListInChildren,
            checkNewVisualBuilderNode,
            shouldShowErrors,
        }),
        [
            visualBuilderGraph,
            checkInvalidConditionsForNode,
            checkInvalidVariablesForNode,
            checkNodeHasVariablesUsedInChildren,
            dispatch,
            getVariableListInChildren,
            checkNewVisualBuilderNode,
            shouldShowErrors,
        ]
    )
}

export function createVisualBuilderContextForPreview(
    visualBuilderGraph: VisualBuilderGraph
): VisualBuilderContext {
    return {
        visualBuilderGraph,
        checkInvalidConditionsForNode: () => false,
        checkInvalidVariablesForNode: () => false,
        checkNodeHasVariablesUsedInChildren: () => false,
        dispatch: _noop,
        getVariableListInChildren: () => [],
        checkNewVisualBuilderNode: () => false,
        shouldShowErrors: false,
    }
}
