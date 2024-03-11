import {useMemo} from 'react'
import {getIncoming} from '../models/visualBuilderGraph.model'
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
        visualBuilderBranchIdsEditing,
        setVisualBuilderBranchIdsEditing,
        checkNodeHasVariablesUsedInChildren,
    } = useWorkflowEditorContext()

    const isSelected = visualBuilderNodeIdEditing === id
    const incomingChoice = getIncoming(visualBuilderGraph, id, 'choice')
    const incomingCondition = getIncoming(visualBuilderGraph, id, 'conditions')

    const isEdgeSelected =
        incomingChoice?.nodeId === visualBuilderNodeIdEditing
            ? true
            : incomingCondition?.id
            ? visualBuilderBranchIdsEditing.includes(incomingCondition.id)
            : false
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
            incomingCondition:
                incomingCondition?.nodeId &&
                incomingCondition?.label &&
                incomingCondition?.id &&
                typeof incomingCondition?.isFallback !== 'undefined'
                    ? {
                          id: incomingCondition.id,
                          label: incomingCondition.label,
                          nodeId: incomingCondition.nodeId,
                          isFallback: incomingCondition.isFallback,
                      }
                    : undefined,
            dispatch,
            isSelected: isEdgeSelected,
            setVisualBuilderNodeIdEditing,
            setVisualBuilderChoiceEventIdEditing,
            setVisualBuilderBranchIdsEditing,
            visualBuilderNodeIdEditing,
        }),
        [
            id,
            configuration.id,
            incomingCondition?.id,
            incomingCondition?.label,
            incomingCondition?.nodeId,
            incomingCondition?.isFallback,
            incomingChoice?.label,
            incomingChoice?.eventId,
            incomingChoice?.nodeId,
            isEdgeSelected,
            dispatch,
            setVisualBuilderNodeIdEditing,
            setVisualBuilderChoiceEventIdEditing,
            setVisualBuilderBranchIdsEditing,
            visualBuilderNodeIdEditing,
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
