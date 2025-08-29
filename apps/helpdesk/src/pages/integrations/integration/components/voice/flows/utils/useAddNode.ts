import { useFormContext } from 'react-hook-form'

import { VoiceFlowNodeType } from '../constants'
import { VoiceFlowFormValues, VoiceFlowNode, VoiceFlowNodeData } from '../types'
import { useVoiceFlow } from '../useVoiceFlow'
import {
    generateNodeData,
    getFormTargetStepId,
    getSourceNodes,
    isBranchingOption,
    linkFormStep,
    pointsToEndNode,
    transformToReactFlowNodes,
} from '../utils'

export const useAddNode = (source: string, target: string) => {
    const { watch, setValue } = useFormContext<VoiceFlowFormValues>()
    const { getNode, getNodes, setNodes } = useVoiceFlow()

    const sourceNode = getNode(source)
    const targetNode = getNode(target)

    const canAddFinalNode = pointsToEndNode(targetNode, getNode)

    const addNewStepInForm = (
        newStepData: VoiceFlowNodeData,
        sourceNode: VoiceFlowNode,
    ) => {
        setValue(`steps.${newStepData.id}`, newStepData)

        // make sure if we're on an intermediary node, we point to the closest node in the form
        const closestSourceNodes = getSourceNodes(sourceNode, getNodes())

        // if there are no form source nodes, it means the new node is the first step
        if (closestSourceNodes.length === 0) {
            setValue('first_step_id', newStepData.id)
            return
        }

        // go through each source node and update the next step id in the form to point to the new node
        closestSourceNodes.forEach((node) => {
            const stepId = isBranchingOption(node)
                ? node.data.parentId
                : node.id
            const formStep = watch(`steps.${stepId}`)
            const updatedFormStep = linkFormStep(node, formStep, newStepData.id)
            if (!updatedFormStep) return
            setValue(`steps.${stepId}`, updatedFormStep)
        })
    }

    const addNode = (nodeType: VoiceFlowNodeType) => {
        if (!sourceNode || !targetNode) return

        const newNodeData = generateNodeData(
            nodeType,
            getFormTargetStepId(targetNode, getNode),
        )
        if (!newNodeData) return

        addNewStepInForm(newNodeData, sourceNode)

        const first_step_id = watch('first_step_id')
        const steps = watch('steps')
        const nodes = transformToReactFlowNodes(
            { first_step_id, steps },
            newNodeData.id,
        )
        setNodes(nodes)
    }

    return { addNode, addNewStepInForm, canAddFinalNode }
}
