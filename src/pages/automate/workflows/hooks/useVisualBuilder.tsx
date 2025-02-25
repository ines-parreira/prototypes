import React, {
    createContext,
    Dispatch,
    useCallback,
    useContext,
    useMemo,
} from 'react'

import _noop from 'lodash/noop'

import { useGetWorkflowConfigurationTemplates } from 'models/workflows/queries'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'

import {
    buildWorkflowVariableFromNode,
    extractVariablesFromNode,
    findManyVariables,
    findVariable,
    getWorkflowVariableListForNode,
} from '../models/variables.model'
import {
    AvailableIntegrations,
    WorkflowVariable,
    WorkflowVariableList,
} from '../models/variables.types'
import { walkVisualBuilderGraph } from '../models/visualBuilderGraph.model'
import {
    VisualBuilderGraph,
    VisualBuilderTriggerNode,
} from '../models/visualBuilderGraph.types'
import { VisualBuilderGraphAction } from './useVisualBuilderGraphReducer'

export type VisualBuilderContextType<
    T extends VisualBuilderTriggerNode = VisualBuilderTriggerNode,
> = {
    visualBuilderGraph: VisualBuilderGraph<T>
    checkNodeHasVariablesUsedInChildren: (nodeId: string) => boolean
    dispatch: Dispatch<VisualBuilderGraphAction>
    getVariableListInChildren: (nodeId: string) => WorkflowVariable[]
    getVariableListForNode: (nodeId: string) => WorkflowVariableList
    checkNewVisualBuilderNode: (nodeId: string) => boolean
    initialVisualBuilderGraph: VisualBuilderGraph<T>
    isNew: boolean
}

export const VisualBuilderContext = createContext<
    VisualBuilderContextType | undefined
>(undefined)

export function useVisualBuilderContext<
    T extends VisualBuilderTriggerNode = VisualBuilderTriggerNode,
>() {
    const contextValue = useContext(VisualBuilderContext)

    if (!contextValue) {
        throw new Error('Visual builder context is undefined,')
    }

    return contextValue as VisualBuilderContextType<T>
}

export const withVisualBuilderContext =
    <
        WrappedProps extends JSX.IntrinsicAttributes & {
            visualBuilderGraph: VisualBuilderGraph
            dispatch: Dispatch<VisualBuilderGraphAction>
            isNew: boolean
        },
    >(
        Component: React.FC<WrappedProps>,
    ) =>
    (props: WrappedProps) => {
        const contextValue = useVisualBuilder(
            props.visualBuilderGraph,
            props.dispatch,
            props.isNew,
        )

        return (
            <VisualBuilderContext.Provider value={contextValue}>
                <Component {...props} />
            </VisualBuilderContext.Provider>
        )
    }

export function useVisualBuilder<
    T extends VisualBuilderTriggerNode = VisualBuilderTriggerNode,
>(
    visualBuilderGraph: VisualBuilderGraph<T>,
    dispatch: Dispatch<VisualBuilderGraphAction>,
    isNew: boolean,
    availableIntegrations: AvailableIntegrations = [],
): VisualBuilderContextType<T> {
    const initialVisualBuilderGraph = useMemo(
        () => visualBuilderGraph,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [visualBuilderGraph.internal_id],
    )

    const triggerNode = visualBuilderGraph.nodes[0]
    const { data: steps = [] } = useGetWorkflowConfigurationTemplates(
        {
            triggers: ['reusable-llm-prompt'],
        },
        { enabled: triggerNode.type === 'llm_prompt_trigger' },
    )
    const { apps } = useApps()

    const getVariableListForNode = useCallback(
        (nodeId: string) => {
            return getWorkflowVariableListForNode(
                visualBuilderGraph,
                nodeId,
                steps,
                apps,
                availableIntegrations,
            )
        },
        [visualBuilderGraph, steps, apps, availableIntegrations],
    )

    const getVariableListInChildren = useCallback(
        (nodeId: string) => {
            const node = visualBuilderGraph.nodes.find((n) => n.id === nodeId)

            if (!node) {
                return []
            }

            const nodeVariable = buildWorkflowVariableFromNode(
                visualBuilderGraph,
                node,
                steps,
                apps,
            )

            if (!nodeVariable) {
                return []
            }

            const availableVariables: WorkflowVariable[] = []

            walkVisualBuilderGraph(visualBuilderGraph, nodeId, (childNode) => {
                const variables = extractVariablesFromNode(
                    childNode,
                    visualBuilderGraph.edges,
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
                        },
                    ),
                )
            })

            return availableVariables
        },
        [visualBuilderGraph, steps, apps],
    )

    const checkNodeHasVariablesUsedInChildren = useCallback(
        (nodeId: string) => {
            const node = visualBuilderGraph.nodes.find((n) => n.id === nodeId)

            if (!node) {
                return false
            }

            const nodeVariable = buildWorkflowVariableFromNode(
                visualBuilderGraph,
                node,
                steps,
                apps,
            )

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
                        },
                    ),
                )
            })

            return found
        },
        [visualBuilderGraph, steps, apps],
    )

    const checkNewVisualBuilderNode = useCallback(
        (nodeId: string) => {
            return (
                isNew ||
                !initialVisualBuilderGraph.nodes.some(
                    (node) => node.id === nodeId,
                )
            )
        },
        [isNew, initialVisualBuilderGraph],
    )

    return useMemo<VisualBuilderContextType<T>>(
        () => ({
            visualBuilderGraph,
            checkNodeHasVariablesUsedInChildren,
            dispatch,
            getVariableListInChildren,
            checkNewVisualBuilderNode,
            getVariableListForNode,
            initialVisualBuilderGraph,
            isNew,
        }),
        [
            visualBuilderGraph,
            checkNodeHasVariablesUsedInChildren,
            dispatch,
            getVariableListInChildren,
            checkNewVisualBuilderNode,
            getVariableListForNode,
            initialVisualBuilderGraph,
            isNew,
        ],
    )
}

export function createVisualBuilderContextForPreview(
    visualBuilderGraph: VisualBuilderGraph,
): VisualBuilderContextType {
    return {
        visualBuilderGraph,
        initialVisualBuilderGraph: visualBuilderGraph,
        checkNodeHasVariablesUsedInChildren: () => false,
        dispatch: _noop,
        getVariableListInChildren: () => [],
        checkNewVisualBuilderNode: () => false,
        getVariableListForNode: () => [],
        isNew: false,
    }
}
