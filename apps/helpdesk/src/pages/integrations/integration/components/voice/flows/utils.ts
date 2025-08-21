import { cloneDeep } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import { CallRoutingFlow, CallRoutingFlowSteps } from '@gorgias/helpdesk-types'

import {
    END_CALL_NODE,
    INCOMING_CALL_NODE,
    VoiceFlowNodeType,
} from './constants'
import {
    IvrMenuNode,
    TimeSplitConditionalNode,
    VoiceFlowNode,
    VoiceFlowNodeBase,
} from './types'

export function canAddNewStepOnEdge(source: VoiceFlowNode): boolean {
    switch (source.type) {
        case VoiceFlowNodeType.IvrMenu:
        case VoiceFlowNodeType.SendToVoicemail:
        case VoiceFlowNodeType.TimeSplitConditional:
            return false
        default:
            return true
    }
}

export function isVoiceFlowStep(
    stepType?: string,
): stepType is VoiceFlowNodeType {
    if (!stepType) return false

    return Object.values(VoiceFlowNodeType).includes(
        stepType as VoiceFlowNodeType,
    )
}

function isBranchingNode(
    node: VoiceFlowNodeBase,
): node is IvrMenuNode | TimeSplitConditionalNode {
    return (
        node.type === VoiceFlowNodeType.IvrMenu ||
        node.type === VoiceFlowNodeType.TimeSplitConditional
    )
}

export function getNextNodes(
    node: VoiceFlowNode,
    nodes: VoiceFlowNode[],
): string[] {
    switch (node.type) {
        case VoiceFlowNodeType.TimeSplitConditional:
            return [node.data.on_true_step_id, node.data.on_false_step_id]
        case VoiceFlowNodeType.IvrMenu:
            const nextNodes = nodes.filter(
                (n) =>
                    n.type === VoiceFlowNodeType.IvrOption &&
                    n.data.parentId === node.id,
            )
            return nextNodes.map((nextNode) => nextNode.id)
        case VoiceFlowNodeType.EndCall:
            return []
        default:
            if ('next_step_id' in node.data) {
                return [node.data.next_step_id || END_CALL_NODE.id]
            }
            return [END_CALL_NODE.id]
    }
}

export function createIvrOptionNode(
    node: IvrMenuNode,
    optionIndex: number,
    nextStepId: string,
): VoiceFlowNodeBase {
    return {
        id: uuidv4(),
        type: VoiceFlowNodeType.IvrOption,
        data: {
            parentId: node.id,
            optionIndex,
            next_step_id: nextStepId,
        },
    }
}

export function createTimeSplitOptionNode(
    node: TimeSplitConditionalNode,
    nextStepId: string,
): VoiceFlowNodeBase {
    return {
        id: uuidv4(),
        type: VoiceFlowNodeType.TimeSplitOption,
        data: {
            parentId: node.id,
            next_step_id: nextStepId,
        },
    }
}

function handleBranchingNode(
    node: IvrMenuNode | TimeSplitConditionalNode,
    voiceFlowNodes: VoiceFlowNodeBase[],
): VoiceFlowNodeBase[] {
    switch (node.type) {
        case VoiceFlowNodeType.IvrMenu: {
            const branchNodes = Object.values(node.data.branch_options).map(
                (branch, index) =>
                    createIvrOptionNode(node, index, branch.next_step_id),
            )

            const updatedParentNode = {
                ...node,
                data: {
                    ...node.data,
                    branch_options: node.data.branch_options.map((opt, i) => ({
                        ...opt,
                        next_step_id: branchNodes[i].id,
                    })),
                },
            }

            const updatedVoiceFlowNodes = voiceFlowNodes.map((n) =>
                n.id === node.id ? updatedParentNode : n,
            )

            return [...updatedVoiceFlowNodes, ...branchNodes]
        }
        case VoiceFlowNodeType.TimeSplitConditional:
            /* create empty nodes for on_true and on_false */
            const onTrueNode = createTimeSplitOptionNode(
                node,
                node.data.on_true_step_id,
            )
            const onFalseNode = createTimeSplitOptionNode(
                node,
                node.data.on_false_step_id,
            )

            const updatedParentNode = {
                ...node,
                data: {
                    ...node.data,
                    on_true_step_id: onTrueNode.id,
                    on_false_step_id: onFalseNode.id,
                },
            }
            const updatedVoiceFlowNodes = voiceFlowNodes.map((n) =>
                n.id === node.id ? updatedParentNode : n,
            )
            return [...updatedVoiceFlowNodes, onTrueNode, onFalseNode]
    }
}

export function connectTerminalStepsToEndCallStep(
    steps: CallRoutingFlowSteps,
): CallRoutingFlowSteps {
    const newSteps = cloneDeep(steps)

    Object.keys(newSteps).forEach((stepId) => {
        const step = newSteps[stepId]
        if (step.step_type === 'ivr_menu') {
            step.branch_options = step.branch_options.map((option) => ({
                ...option,
                next_step_id: option.next_step_id || END_CALL_NODE.id,
            }))
        } else if (step.step_type === 'time_split_conditional') {
            step.on_true_step_id = step.on_true_step_id || END_CALL_NODE.id
            step.on_false_step_id = step.on_false_step_id || END_CALL_NODE.id
        } else if ('next_step_id' in step) {
            step.next_step_id = step.next_step_id || END_CALL_NODE.id
        }
    })

    return newSteps
}

export function transformToReactFlowNodes(
    flow: CallRoutingFlow,
): VoiceFlowNode[] {
    const steps = connectTerminalStepsToEndCallStep(flow.steps)
    const nodes = Object.entries(steps).map(([id, step]) => {
        return isVoiceFlowStep(step.step_type)
            ? {
                  id,
                  type: step.step_type,
                  data: step,
              }
            : null
    })

    const withBranchNodes = nodes.reduce((acc, node) => {
        if (node === null) return acc

        if (isBranchingNode(node)) {
            const currentNodes = [...acc, node]
            return handleBranchingNode(node, currentNodes)
        }

        return [...acc, node]
    }, [] as VoiceFlowNodeBase[])

    const incomingCallNode = {
        ...INCOMING_CALL_NODE,
        data: { next_step_id: flow.first_step_id },
    }

    const allNodes: VoiceFlowNodeBase[] = [
        incomingCallNode,
        ...withBranchNodes,
        END_CALL_NODE,
    ] satisfies VoiceFlowNodeBase[]

    const withPosition: VoiceFlowNode[] = allNodes.map(
        (node) =>
            ({
                ...node,
                position: { x: 0, y: 0 },
            }) as VoiceFlowNode,
    )

    return withPosition
}
