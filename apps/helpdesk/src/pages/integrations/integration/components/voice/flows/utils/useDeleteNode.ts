import { EnqueueStep } from '@gorgias/helpdesk-types'

import { useFormContext } from 'core/forms'
import { bfsNodesBetween, getIntermediaryNodeId } from 'core/ui/flows/utils'

import { END_CALL_NODE, VoiceFlowNodeType } from '../constants'
import { useUpdateNodes } from '../hooks/useUpdateNodes'
import { VoiceFlowFormValues } from '../types'
import { useVoiceFlow } from '../useVoiceFlow'
import {
    bfsFlow,
    getFormTargetStepId,
    getNextNodes,
    isBranchingNode,
    updateFormFlowOnNodeDelete,
} from '../utils'

export function useDeleteNode() {
    const { unregister, setValue, watch } =
        useFormContext<VoiceFlowFormValues>()
    const { getNode, getNodes } = useVoiceFlow()
    const updateNodes = useUpdateNodes()

    const deleteEnqueueBranches = (nodeId: string) => {
        const flow = watch()
        const currentStep = flow.steps[nodeId]

        if (currentStep?.step_type !== VoiceFlowNodeType.Enqueue) {
            return
        }

        const intermediaryNodeId = getIntermediaryNodeId(nodeId)
        const intermediaryNode = getNode(intermediaryNodeId)

        const defaultBranchStepId = currentStep.next_step_id
        const skipBranchStepId = currentStep.skip_step_id

        if (!intermediaryNode) {
            return
        }

        const branchConnectorStepId = getFormTargetStepId(
            intermediaryNode,
            getNode,
        )

        const nodes = getNodes()

        let newFlow = flow
        const removableNodes: string[] = []

        if (
            defaultBranchStepId &&
            defaultBranchStepId !== branchConnectorStepId
        ) {
            /* remove nodes between default branch step and branch connector step */
            const defaultBranchNodes = bfsNodesBetween(
                nodes,
                defaultBranchStepId,
                branchConnectorStepId || END_CALL_NODE.id,
                getNextNodes,
            )

            newFlow = updateFormFlowOnNodeDelete(
                flow,
                defaultBranchStepId,
                defaultBranchNodes,
                branchConnectorStepId,
            )

            removableNodes.push(...defaultBranchNodes)
        }

        if (skipBranchStepId && skipBranchStepId !== branchConnectorStepId) {
            /* remove nodes between skip branch step and branch connector step */
            const skipBranchNodes = bfsNodesBetween(
                nodes,
                skipBranchStepId,
                branchConnectorStepId || END_CALL_NODE.id,
                getNextNodes,
            )

            newFlow = updateFormFlowOnNodeDelete(
                newFlow,
                skipBranchStepId,
                skipBranchNodes,
                branchConnectorStepId,
            )

            removableNodes.push(...skipBranchNodes)
        }

        removableNodes.forEach((removedNodeId) => {
            unregister(`steps.${removedNodeId}`)
        })

        delete (newFlow.steps[nodeId] as EnqueueStep).skip_step_id

        /* if it's not unregistering here, trying to register it later won't work */
        unregister(`steps.${nodeId}.skip_step_id`)

        setValue('steps', newFlow.steps, {
            shouldDirty: true,
        })
        updateNodes()
    }

    const deleteNode = (nodeId: string) => {
        const currentFlow = watch()
        const currentNode = getNode(nodeId)
        let branchConnectorStepId: string | null | undefined
        let branchingSubflowNodes: string[] = []
        const isBranchingStep = currentNode && isBranchingNode(currentNode)
        const nodes = getNodes()

        if (isBranchingStep && getNextNodes(currentNode, nodes).length > 1) {
            const intermediaryNodeId = getIntermediaryNodeId(nodeId)
            const intermediaryNode = getNode(intermediaryNodeId)

            if (!intermediaryNode) return

            branchingSubflowNodes = bfsNodesBetween(
                nodes,
                nodeId,
                intermediaryNodeId,
                getNextNodes,
            )

            branchConnectorStepId = getFormTargetStepId(
                intermediaryNode,
                getNode,
            )
        }

        const newFlow = updateFormFlowOnNodeDelete(
            currentFlow,
            nodeId,
            branchingSubflowNodes,
            branchConnectorStepId,
        )

        if (isBranchingStep) {
            branchingSubflowNodes.forEach((nodeId) => {
                unregister(`steps.${nodeId}`)
            })
        } else {
            unregister(`steps.${nodeId}`)
        }

        setValue('steps', newFlow.steps, { shouldDirty: true })
        setValue('first_step_id', newFlow.first_step_id)
        updateNodes()
    }

    const deleteBranch = (
        optionType:
            | VoiceFlowNodeType.CustomerLookupOption
            | VoiceFlowNodeType.IvrOption,
        optionIndex: number,
        parentId: string,
        nextStepId: string,
    ) => {
        const currentFlow = watch()

        const optionNode = getNodes().find(
            (n) =>
                n.type === optionType &&
                n.data.optionIndex === optionIndex &&
                n.data.parentId === parentId,
        )
        if (!optionNode || optionNode.type !== optionType) return

        const branchingSubflowNodes = bfsNodesBetween(
            getNodes(),
            optionNode.id,
            nextStepId,
            getNextNodes,
        )
        branchingSubflowNodes.forEach((nodeId) => {
            delete currentFlow.steps[nodeId]
            unregister(`steps.${nodeId}`)
        })
        setValue('steps', currentFlow.steps, { shouldDirty: true })
        updateNodes()
    }

    const removeUnlinkedSteps = () => {
        const flow = watch()

        const linkedSteps = bfsFlow(flow)

        Object.keys(flow.steps).forEach((stepId) => {
            if (!linkedSteps.includes(stepId)) {
                unregister(`steps.${stepId}`)
            }
        })

        updateNodes()
    }

    return {
        deleteNode,
        deleteBranch,
        deleteEnqueueBranches,
        removeUnlinkedSteps,
    }
}
