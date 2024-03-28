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
    const incomingHttpRequestCondition = getIncoming(
        visualBuilderGraph,
        id,
        'http_request'
    )

    const isEdgeSelected = useMemo(() => {
        const isChoiceSelected =
            incomingChoice?.nodeId === visualBuilderNodeIdEditing
        if (isChoiceSelected) return true

        const isConditionsSelected =
            incomingCondition?.id &&
            visualBuilderBranchIdsEditing.includes(incomingCondition.id)
        if (isConditionsSelected) return false

        const isHttpRequestSelected =
            incomingHttpRequestCondition?.nodeId === visualBuilderNodeIdEditing
        if (isHttpRequestSelected) return true

        return false
    }, [
        incomingChoice?.nodeId,
        incomingCondition?.id,
        incomingHttpRequestCondition,
        visualBuilderBranchIdsEditing,
        visualBuilderNodeIdEditing,
    ])

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
            httpRequestCondition:
                incomingHttpRequestCondition?.nodeId &&
                incomingHttpRequestCondition?.label &&
                incomingHttpRequestCondition?.id &&
                typeof incomingHttpRequestCondition?.isFallback !== 'undefined'
                    ? {
                          id: incomingHttpRequestCondition.id,
                          label: incomingHttpRequestCondition.label,
                          nodeId: incomingHttpRequestCondition.nodeId,
                          isFallback: incomingHttpRequestCondition.isFallback,
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
            incomingHttpRequestCondition?.id,
            incomingHttpRequestCondition?.label,
            incomingHttpRequestCondition?.nodeId,
            incomingHttpRequestCondition?.isFallback,
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
