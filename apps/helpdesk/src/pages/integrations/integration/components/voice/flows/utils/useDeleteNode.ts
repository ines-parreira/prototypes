import { cloneDeep } from 'lodash'

import { useFormContext } from 'core/forms'
import { getIntermediaryNodeId } from 'core/ui/flows/utils'

import { VoiceFlowNodeType } from '../constants'
import { useUpdateNodes } from '../hooks/useUpdateNodes'
import type { VoiceFlowFormValues } from '../types'
import { useVoiceFlow } from '../useVoiceFlow'
import {
    bfsFlow,
    getFormTargetStepId,
    getNextSteps,
    isBranchingNode,
    updateFormFlowOnNodeDelete,
} from '../utils'

export function useDeleteNode() {
    const { unregister, setValue, watch, trigger } =
        useFormContext<VoiceFlowFormValues>()
    const { getNode } = useVoiceFlow()
    const updateNodes = useUpdateNodes()

    const deleteEnqueueBranches = (nodeId: string) => {
        const flow = watch()
        const currentStep = flow.steps[nodeId]

        if (currentStep?.step_type !== VoiceFlowNodeType.Enqueue) {
            return
        }

        const intermediaryNodeId = getIntermediaryNodeId(nodeId)
        const intermediaryNode = getNode(intermediaryNodeId)

        if (!intermediaryNode) {
            return
        }

        const branchConnectorStepId = getFormTargetStepId(
            intermediaryNode,
            getNode,
        )

        /* if it's not unregistering here, trying to register it later won't work */
        unregister(`steps.${nodeId}.skip_step_id`)

        setValue(`steps.${nodeId}.next_step_id`, branchConnectorStepId, {
            shouldDirty: true,
        })

        removeUnlinkedSteps()
    }

    const deleteNode = (nodeId: string) => {
        const currentFlow = watch()
        const currentNode = getNode(nodeId)
        let branchConnectorStepId: string | null | undefined
        const isBranchingStep = currentNode && isBranchingNode(currentNode)

        if (
            isBranchingStep &&
            getNextSteps(currentFlow.steps, nodeId).length > 1
        ) {
            const intermediaryNodeId = getIntermediaryNodeId(nodeId)
            const intermediaryNode = getNode(intermediaryNodeId)

            if (!intermediaryNode) return

            branchConnectorStepId = getFormTargetStepId(
                intermediaryNode,
                getNode,
            )
        }

        const newFlow = updateFormFlowOnNodeDelete(
            currentFlow,
            nodeId,
            branchConnectorStepId,
        )

        setValue('steps', newFlow.steps, { shouldDirty: true })
        setValue('first_step_id', newFlow.first_step_id)
        removeUnlinkedSteps()
    }

    const removeUnlinkedSteps = () => {
        const flow = watch()

        const linkedSteps = bfsFlow(flow)
        const flowClone = cloneDeep(flow)

        Object.keys(flow.steps).forEach((stepId) => {
            if (!linkedSteps.includes(stepId)) {
                delete flowClone.steps[stepId]
            }
        })

        setValue('steps', flowClone.steps, { shouldDirty: true })
        /* trigger validation manually to make sure the old errors are cleared */
        trigger()
        updateNodes()
    }

    return {
        deleteNode,
        deleteEnqueueBranches,
        removeUnlinkedSteps,
    }
}
