import {useMemo} from 'react'
import {getIncomingChoice} from '../models/visualBuilderGraph.model'
import {VisualBuilderEdgeProps} from '../editor/visualBuilder/components/EdgeBlock'
import {VisualBuilderDeleteProps} from '../editor/visualBuilder/components/NodeDeleteIcon'
import {useWorkflowEditorContext} from './useWorkflowEditor'

type Node = {
    id: string
    data: {
        isGreyedOut?: boolean | null
    }
}

export type VisualBuilderNodeProps = {
    isGreyedOut: boolean | null | undefined
    shouldShowErrors: boolean
    isSelected: boolean
    edgeProps: VisualBuilderEdgeProps
    deleteProps: VisualBuilderDeleteProps
}

export function useVisualBuilderNodeProps({
    id,
    data: {isGreyedOut},
}: Node): VisualBuilderNodeProps {
    const {
        shouldShowErrors,
        visualBuilderGraph,
        configuration,
        dispatch,
        visualBuilderNodeIdEditing,
        setVisualBuilderNodeIdEditing,
        setVisualBuilderChoiceEventIdEditing,
        checkNodeHasVariablesUsedInChildren,
    } = useWorkflowEditorContext()

    const isSelected = visualBuilderNodeIdEditing === id
    const incomingChoice = getIncomingChoice(visualBuilderGraph, id)

    const isEdgeSelected = incomingChoice?.nodeId === visualBuilderNodeIdEditing
    const edgeProps: VisualBuilderEdgeProps = useMemo(
        () => ({
            nodeId: id,
            configurationId: configuration.id,
            incomingChoice:
                incomingChoice?.label &&
                incomingChoice?.eventId &&
                incomingChoice?.nodeId
                    ? {
                          label: incomingChoice.label,
                          eventId: incomingChoice.eventId,
                          nodeId: incomingChoice.nodeId,
                      }
                    : undefined,
            dispatch,
            isSelected: isEdgeSelected,
            setVisualBuilderNodeIdEditing,
            setVisualBuilderChoiceEventIdEditing,
        }),
        [
            id,
            configuration.id,
            incomingChoice?.label,
            incomingChoice?.eventId,
            incomingChoice?.nodeId,
            isEdgeSelected,
            dispatch,
            setVisualBuilderNodeIdEditing,
            setVisualBuilderChoiceEventIdEditing,
        ]
    )

    const hasMultipleChildren =
        visualBuilderGraph.edges
            .filter((e) => e.source === id)
            .map((e) => e.target).length > 1

    const hasVariablesUsedInChildren = useMemo(
        () => checkNodeHasVariablesUsedInChildren(id),
        [id, checkNodeHasVariablesUsedInChildren]
    )
    const deleteProps: VisualBuilderDeleteProps = useMemo(
        () => ({
            nodeId: id,
            hasMultipleChildren,
            hasVariablesUsedInChildren,
            dispatch,
        }),
        [id, hasMultipleChildren, hasVariablesUsedInChildren, dispatch]
    )

    return {
        shouldShowErrors,
        isSelected,
        isGreyedOut,
        edgeProps,
        deleteProps,
    }
}
