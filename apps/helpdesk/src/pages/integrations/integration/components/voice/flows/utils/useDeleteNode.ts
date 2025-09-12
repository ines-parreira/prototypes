import { useFormContext } from 'core/forms'
import { bfsNodesBetween, getIntermediaryNodeId } from 'core/ui/flows/utils'

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
        setValue('steps', newFlow.steps)
        setValue('first_step_id', newFlow.first_step_id)
        setNodes(nodes)
    }

    return { deleteNode }
}
