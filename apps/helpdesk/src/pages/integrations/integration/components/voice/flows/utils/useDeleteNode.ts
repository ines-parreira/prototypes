import { EnqueueStep } from '@gorgias/helpdesk-types'

import { useFormContext } from 'core/forms'
import { bfsNodesBetween, getIntermediaryNodeId } from 'core/ui/flows/utils'

import { END_CALL_NODE, VoiceFlowNodeType } from '../constants'
import { VoiceFlowFormValues } from '../types'
import { useVoiceFlow } from '../useVoiceFlow'
import {
    getFormTargetStepId,
    getNextNodes,
    isBranchingNode,
    transformToReactFlowNodes,
    updateFormFlowOnNodeDelete,
} from '../utils'

export function useDeleteNode() {
    const { unregister, setValue, watch } =
        useFormContext<VoiceFlowFormValues>()
    const { setNodes, getNode, getNodes } = useVoiceFlow()

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

        const newNodes = transformToReactFlowNodes(newFlow)
        setValue('steps', newFlow.steps, {
            shouldDirty: true,
        })
        setNodes(newNodes)
    }

    const deleteNode = (nodeId: string) => {
        const currentFlow = watch()
        const currentNode = getNode(nodeId)
        let branchConnectorStepId: string | null | undefined
        let branchingSubflowNodes: string[] = []
        const isBranchingStep = currentNode && isBranchingNode(currentNode)

        if (isBranchingStep) {
            const intermediaryNodeId = getIntermediaryNodeId(nodeId)
            const intermediaryNode = getNode(intermediaryNodeId)

            if (!intermediaryNode) return

            branchingSubflowNodes = bfsNodesBetween(
                getNodes(),
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

        const nodes = transformToReactFlowNodes(newFlow)
        setValue('steps', newFlow.steps, { shouldDirty: true })
        setValue('first_step_id', newFlow.first_step_id)
        setNodes(nodes)
    }

    const deleteIvrBranch = (
        optionIndex: number,
        parentId: string,
        nextStepId: string,
    ) => {
        const currentFlow = watch()

        const optionNode = getNodes().find(
            (n) =>
                n.type === VoiceFlowNodeType.IvrOption &&
                n.data.optionIndex === optionIndex &&
                n.data.parentId === parentId,
        )
        if (!optionNode || optionNode.type !== VoiceFlowNodeType.IvrOption)
            return

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

        setNodes((nodes) =>
            nodes
                .filter((node) => !branchingSubflowNodes.includes(node.id))
                .map((node) => {
                    if (
                        node.type === VoiceFlowNodeType.IvrOption &&
                        node.data.parentId === parentId &&
                        node.data.optionIndex >= optionIndex
                    ) {
                        // Decrement option index of options after the deleted one
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                optionIndex: node.data.optionIndex - 1,
                            },
                        }
                    }
                    return node
                }),
        )
    }

    return { deleteNode, deleteIvrBranch, deleteEnqueueBranches }
}
