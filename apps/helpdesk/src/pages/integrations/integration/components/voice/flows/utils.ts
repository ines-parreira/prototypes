import { Edge } from '@xyflow/react'
import { cloneDeep } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import {
    CallRoutingFlow,
    CallRoutingFlowSteps,
    CustomerFieldsConditionalStep,
    EnqueueStep,
    IvrMenuStep,
    PlayMessageStep,
    SendToSMSStep,
    SendToVoicemailStep,
    TimeSplitConditionalRuleType,
    TimeSplitConditionalStep,
    VoiceCallbackRequests,
} from '@gorgias/helpdesk-types'

import { ConvergencePoint } from 'core/ui/flows/types'
import {
    findConvergencePoints,
    insertConvergenceNodes,
} from 'core/ui/flows/utils'
import { DEFAULT_CALLBACK_REQUESTS } from 'models/integration/constants'

import {
    END_CALL_NODE,
    INCOMING_CALL_NODE,
    VoiceFlowNodeType,
} from './constants'
import {
    CustomerLookupNode,
    CustomerLookupOptionNode,
    EnqueueNode,
    EnqueueOptionNode,
    IntermediaryNode,
    IvrMenuNode,
    IvrOptionNode,
    TimeSplitConditionalNode,
    TimeSplitOptionNode,
    VoiceFlowNode,
    VoiceFlowNodeBase,
    VoiceFlowNodeData,
} from './types'

export function canAddNewStepOnEdge(
    source: VoiceFlowNode,
    target: VoiceFlowNode,
): boolean {
    switch (source.type) {
        case VoiceFlowNodeType.IvrMenu:
        case VoiceFlowNodeType.SendToVoicemail:
        case VoiceFlowNodeType.TimeSplitConditional:
        case VoiceFlowNodeType.SendToSMS:
        case VoiceFlowNodeType.Intermediary:
        case VoiceFlowNodeType.CustomerLookup:
            return false
        case VoiceFlowNodeType.Enqueue:
            return target.type !== VoiceFlowNodeType.EnqueueOption
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

export function isBranchingNode(
    node: VoiceFlowNodeBase,
): node is
    | IvrMenuNode
    | TimeSplitConditionalNode
    | EnqueueNode
    | CustomerLookupNode {
    const isEnqueueBranchingNode =
        node.type === VoiceFlowNodeType.Enqueue &&
        'conditional_routing' in node.data &&
        node.data.conditional_routing

    return (
        isEnqueueBranchingNode ||
        [
            VoiceFlowNodeType.CustomerLookup,
            VoiceFlowNodeType.IvrMenu,
            VoiceFlowNodeType.TimeSplitConditional,
        ].includes(node.type)
    )
}

export function isBranchingOption(
    node: VoiceFlowNodeBase,
): node is TimeSplitOptionNode | IvrOptionNode | EnqueueOptionNode {
    return (
        node.type === VoiceFlowNodeType.TimeSplitOption ||
        node.type === VoiceFlowNodeType.IvrOption ||
        node.type === VoiceFlowNodeType.EnqueueOption ||
        node.type === VoiceFlowNodeType.CustomerLookupOption
    )
}

export function getNextNodes(
    node: VoiceFlowNode,
    nodes: VoiceFlowNode[],
): string[] {
    switch (node.type) {
        case VoiceFlowNodeType.CustomerLookup:
            const branchOptions = node.data.branch_options.map(
                (option) => option.next_step_id,
            )
            return [
                ...branchOptions,
                node.data.default_next_step_id ?? END_CALL_NODE.id,
            ]
        case VoiceFlowNodeType.Enqueue:
            const nextStepId = node.data.next_step_id ?? END_CALL_NODE.id
            const skipStepId = node.data.skip_step_id ?? END_CALL_NODE.id
            return node.data.conditional_routing
                ? [nextStepId, skipStepId]
                : [nextStepId]
        case VoiceFlowNodeType.TimeSplitConditional:
            const onTrueId = node.data.on_true_step_id ?? END_CALL_NODE.id
            const onFalseId = node.data.on_false_step_id ?? END_CALL_NODE.id
            if (onTrueId === onFalseId) {
                return [onTrueId]
            }
            return [onTrueId, onFalseId]
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

export function getNextSteps(
    steps: CallRoutingFlowSteps,
    stepId: string,
    includeInactive?: boolean,
): (string | null | undefined)[] {
    const step = steps[stepId]

    switch (step.step_type) {
        case VoiceFlowNodeType.CustomerLookup:
            const branchOptions = step.branch_options.map(
                (option) => option.next_step_id,
            )
            return [...branchOptions, step.default_next_step_id]
        case VoiceFlowNodeType.IvrMenu:
            return step.branch_options.map((option) => option.next_step_id)
        case VoiceFlowNodeType.TimeSplitConditional:
            return [step.on_true_step_id, step.on_false_step_id]
        case VoiceFlowNodeType.Enqueue:
            return includeInactive || step.conditional_routing
                ? [step.next_step_id, step.skip_step_id]
                : [step.next_step_id]
        default:
            if ('next_step_id' in step) {
                return [step.next_step_id]
            }
            return []
    }
}

export function getParentSteps(
    steps: CallRoutingFlowSteps,
    stepId: string,
): string[] {
    const parentSteps = Object.keys(steps).filter((id) => {
        return getNextSteps(steps, id, true).includes(stepId)
    })

    return parentSteps
}

export function createIvrOptionNode(
    parentId: string,
    optionIndex: number,
    nextStepId: string | null,
): VoiceFlowNodeBase<IvrOptionNode> {
    return {
        id: uuidv4(),
        type: VoiceFlowNodeType.IvrOption,
        data: {
            parentId,
            optionIndex,
            next_step_id: nextStepId!,
        },
    }
}

export function createTimeSplitOptionNode(
    node: TimeSplitConditionalNode,
    nextStepId: string | null,
    isTrueBranch: boolean,
): VoiceFlowNodeBase {
    return {
        id: `${node.id}-${isTrueBranch ? 'true' : 'false'}`,
        type: VoiceFlowNodeType.TimeSplitOption,
        data: {
            parentId: node.id,
            next_step_id: nextStepId,
            isTrueBranch,
        },
    }
}

export function createEnqueueOptionNode(
    parentId: string,
    isSkipStep: boolean,
    nextStepId: string | null,
): VoiceFlowNodeBase {
    return {
        id: uuidv4(),
        type: VoiceFlowNodeType.EnqueueOption,
        data: {
            parentId,
            isSkipStep,
            next_step_id: nextStepId,
        },
    }
}

export function createCustomerLookupOptionNode(
    parentId: string,
    isDefaultOption: boolean,
    optionIndex: number | null,
    nextStepId: string | null,
): VoiceFlowNodeBase<CustomerLookupOptionNode> {
    return {
        id: uuidv4(),
        type: VoiceFlowNodeType.CustomerLookupOption,
        data: {
            parentId,
            isDefaultOption,
            optionIndex,
            next_step_id: nextStepId!,
        },
    }
}

function handleBranchingNode(
    node:
        | IvrMenuNode
        | TimeSplitConditionalNode
        | EnqueueNode
        | CustomerLookupNode,
    voiceFlowNodes: VoiceFlowNodeBase[],
): VoiceFlowNodeBase[] {
    switch (node.type) {
        case VoiceFlowNodeType.CustomerLookup: {
            const defaultBranchOption = createCustomerLookupOptionNode(
                node.id,
                true,
                null,
                node.data.default_next_step_id,
            )
            const branchOptions = Object.values(node.data.branch_options).map(
                (option, index) =>
                    createCustomerLookupOptionNode(
                        node.id,
                        false,
                        index,
                        option.next_step_id,
                    ),
            )

            const updatedParentNode = {
                ...node,
                data: {
                    ...node.data,
                    default_next_step_id: defaultBranchOption.id,
                    branch_options: node.data.branch_options.map((opt, i) => ({
                        ...opt,
                        next_step_id: branchOptions[i].id,
                    })),
                },
            }

            const updatedVoiceFlowNodes = voiceFlowNodes.map((n) =>
                n.id === node.id ? updatedParentNode : n,
            )

            return [
                ...updatedVoiceFlowNodes,
                defaultBranchOption,
                ...branchOptions,
            ]
        }
        case VoiceFlowNodeType.IvrMenu: {
            const branchNodes = Object.values(node.data.branch_options).map(
                (branch, index) =>
                    createIvrOptionNode(node.id, index, branch.next_step_id),
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
        case VoiceFlowNodeType.TimeSplitConditional: {
            /* create empty nodes for on_true and on_false */
            const onTrueNode = createTimeSplitOptionNode(
                node,
                node.data.on_true_step_id,
                true,
            )
            const onFalseNode = createTimeSplitOptionNode(
                node,
                node.data.on_false_step_id,
                false,
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
        case VoiceFlowNodeType.Enqueue: {
            if (!node.data.conditional_routing) {
                return voiceFlowNodes
            }

            const skipOptionNode = createEnqueueOptionNode(
                node.id,
                true,
                node.data.skip_step_id ?? null,
            )
            const defaultOptionNode = createEnqueueOptionNode(
                node.id,
                false,
                node.data.next_step_id ?? null,
            )
            const updatedParentNode = {
                ...node,
                data: {
                    ...node.data,
                    next_step_id: defaultOptionNode.id,
                    skip_step_id: skipOptionNode.id,
                },
            }
            const updatedVoiceFlowNodes = voiceFlowNodes.map((n) =>
                n.id === node.id ? updatedParentNode : n,
            )

            return [...updatedVoiceFlowNodes, skipOptionNode, defaultOptionNode]
        }
    }
}

function connectTerminalStepsToEndCallStep(
    steps: CallRoutingFlowSteps,
): CallRoutingFlowSteps {
    const newSteps = cloneDeep(steps)

    Object.keys(newSteps).forEach((stepId) => {
        const step = newSteps[stepId]
        if (step.step_type === VoiceFlowNodeType.CustomerLookup) {
            step.default_next_step_id =
                step.default_next_step_id || END_CALL_NODE.id
            step.branch_options = step.branch_options.map((option) => ({
                ...option,
                next_step_id: option.next_step_id || END_CALL_NODE.id,
            }))
        } else if (step.step_type === VoiceFlowNodeType.IvrMenu) {
            step.branch_options = step.branch_options.map((option) => ({
                ...option,
                next_step_id: option.next_step_id || END_CALL_NODE.id,
            }))
        } else if (step.step_type === VoiceFlowNodeType.TimeSplitConditional) {
            step.on_true_step_id = step.on_true_step_id || END_CALL_NODE.id
            step.on_false_step_id = step.on_false_step_id || END_CALL_NODE.id
        } else if (step.step_type === VoiceFlowNodeType.Enqueue) {
            step.next_step_id = step.next_step_id || END_CALL_NODE.id
            if (step.conditional_routing) {
                step.skip_step_id = step.skip_step_id || END_CALL_NODE.id
            }
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
        data: { next_step_id: flow.first_step_id || END_CALL_NODE.id },
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

    return insertVoiceConvergenceNodes(withPosition)
}

export const findConvergencePointsInVoiceFlow = (
    nodes: VoiceFlowNode[],
): ConvergencePoint[] => {
    return findConvergencePoints(nodes, getNextNodes).filter(
        (cp) =>
            // filter out convergence points that are intermediary nodes as those are already handled
            nodes.find((n) => n.id === cp.targetNodeId)?.type !==
            VoiceFlowNodeType.Intermediary,
    )
}

export const createIntermediaryNode = (
    convergence: ConvergencePoint,
    id?: string | null,
): IntermediaryNode => {
    return {
        id: id || uuidv4(),
        type: VoiceFlowNodeType.Intermediary,
        data: {
            next_step_id: convergence.targetNodeId,
        },
        position: { x: 0, y: 0 },
    }
}

export const insertIntermediaryNode = (
    intermediaryNode: IntermediaryNode,
    convergence: ConvergencePoint,
    nodes: VoiceFlowNode[],
): VoiceFlowNode[] => {
    const modifiedNodes = [...nodes, intermediaryNode]

    convergence.convergingNodes.forEach((nodeId) => {
        const node = nodes.find((n) => n.id === nodeId)
        if (!node) return

        switch (node.type) {
            case VoiceFlowNodeType.TimeSplitConditional:
            case VoiceFlowNodeType.IvrMenu:
            case VoiceFlowNodeType.EndCall:
            case VoiceFlowNodeType.CustomerLookup:
                // these nodes shouldn't be included in convergence points (they should be filtered out before)
                // we just safeguard against it here
                break
            default:
                node.data.next_step_id = intermediaryNode.id
                break
        }
    })
    return modifiedNodes
}

export const insertVoiceConvergenceNodes = (
    nodes: VoiceFlowNode[],
): VoiceFlowNode[] => {
    return insertConvergenceNodes(
        nodes,
        getNextNodes,
        findConvergencePointsInVoiceFlow,
        createIntermediaryNode,
        insertIntermediaryNode,
    )
}

export function getEdgeProps(
    edge: Edge,
    nodes: VoiceFlowNode[],
): { weight?: number; height?: number } {
    const sourceStep = nodes.find((node) => node.id === edge.source)

    const BRANCHING_PROP = { weight: 50, height: 12 }
    const OPTIONS_PROP = { weight: 45, height: 24 }
    const DEFAULT_PROP = { weight: 1, height: 24 }

    switch (sourceStep?.type) {
        case VoiceFlowNodeType.Enqueue:
            return sourceStep?.data.conditional_routing
                ? BRANCHING_PROP
                : DEFAULT_PROP
        // short edges, that bring the elements closer together
        case VoiceFlowNodeType.IvrMenu:
        case VoiceFlowNodeType.TimeSplitConditional:
        case VoiceFlowNodeType.CustomerLookup:
            return BRANCHING_PROP
        case VoiceFlowNodeType.IvrOption:
        case VoiceFlowNodeType.TimeSplitOption:
        case VoiceFlowNodeType.EnqueueOption:
        case VoiceFlowNodeType.CustomerLookupOption:
            return OPTIONS_PROP
        default:
            return DEFAULT_PROP
    }
}

export const generateNodeData = (
    type: VoiceFlowNodeType,
    next_step_id: string | null,
): VoiceFlowNodeData | null => {
    switch (type) {
        case VoiceFlowNodeType.TimeSplitConditional:
            const timeSplitConditional: TimeSplitConditionalStep = {
                id: uuidv4(),
                name: 'Time rule',
                step_type: VoiceFlowNodeType.TimeSplitConditional,
                on_true_step_id: next_step_id!,
                on_false_step_id: next_step_id!,
                rule_type: TimeSplitConditionalRuleType.BusinessHours,
            }
            return timeSplitConditional
        case VoiceFlowNodeType.CustomerLookup:
            const customerLookup: CustomerFieldsConditionalStep = {
                id: uuidv4(),
                name: 'Customer lookup',
                step_type: VoiceFlowNodeType.CustomerLookup,
                default_next_step_id: next_step_id,
                branch_options: [],
                custom_field_id: null!,
            }
            return customerLookup
        case VoiceFlowNodeType.IvrMenu:
            const ivrMenu: IvrMenuStep = {
                id: uuidv4(),
                name: 'IVR Menu',
                step_type: VoiceFlowNodeType.IvrMenu,
                branch_options: [
                    {
                        input_digit: '1',
                        next_step_id: next_step_id!,
                    },
                    {
                        input_digit: '2',
                        next_step_id: next_step_id!,
                    },
                ],
                message: {
                    voice_message_type: 'text_to_speech',
                    text_to_speech_content: '',
                },
            }
            return ivrMenu
        case VoiceFlowNodeType.PlayMessage:
            const playMessage: PlayMessageStep = {
                id: uuidv4(),
                name: 'Play message',
                step_type: VoiceFlowNodeType.PlayMessage,
                message: {
                    voice_message_type: 'text_to_speech',
                    text_to_speech_content: '',
                },
                next_step_id: next_step_id!,
            }
            return playMessage
        case VoiceFlowNodeType.SendToVoicemail:
            const sendToVoicemail: SendToVoicemailStep = {
                id: uuidv4(),
                name: 'Send to voicemail',
                step_type: VoiceFlowNodeType.SendToVoicemail,
                voicemail: {
                    voice_message_type: 'text_to_speech',
                    text_to_speech_content:
                        "Hello! Unfortunately, we aren't able to take your call right now. Please call us back later or leave a message. Thank you!",
                },
                allow_to_leave_voicemail: true,
                next_step_id: null,
            }
            return sendToVoicemail
        case VoiceFlowNodeType.SendToSMS:
            const sendToSms: SendToSMSStep = {
                id: uuidv4(),
                name: 'Send to SMS',
                step_type: VoiceFlowNodeType.SendToSMS,
                confirmation_message: {
                    voice_message_type: 'text_to_speech',
                    text_to_speech_content:
                        "Thank you for contacting us! We're moving to text messaging now, you’ll receive our message shortly.",
                },
                sms_content:
                    "Hello! We're following up on your call. How can we assist you today?",
                sms_integration_id: null!,
                next_step_id: null,
            }
            return sendToSms
        case VoiceFlowNodeType.Enqueue:
            const enqueue: EnqueueStep = {
                id: uuidv4(),
                name: 'Route to',
                step_type: VoiceFlowNodeType.Enqueue,
                callback_requests: {
                    ...cloneDeep(DEFAULT_CALLBACK_REQUESTS),
                } as VoiceCallbackRequests,
                conditional_routing: false,
                queue_id: null!,
                next_step_id: next_step_id!,
            }
            return enqueue

        case VoiceFlowNodeType.ForwardToExternalNumber:
            return {
                id: uuidv4(),
                name: 'Forward to',
                step_type: VoiceFlowNodeType.ForwardToExternalNumber,
                external_number: '',
                next_step_id: next_step_id,
            }
        default:
            return null
    }
}

export const getSourceNodes = (
    node: VoiceFlowNode,
    nodes: VoiceFlowNode[],
): VoiceFlowNode[] => {
    // Remove intermediary nodes and get their sources instead
    switch (node.type) {
        case VoiceFlowNodeType.IncomingCall:
            return []
        case VoiceFlowNodeType.Intermediary:
            const sourceNodes = nodes.filter(
                (n) => getNextNodes(n, nodes).indexOf(node.id) !== -1,
            )
            return [
                ...new Set(
                    sourceNodes.map((sn) => getSourceNodes(sn, nodes)).flat(),
                ),
            ]
        default:
            return [node]
    }
}

export const getFormTargetStepId = (
    node: VoiceFlowNode,
    getNode: (nodeId: string) => VoiceFlowNode | undefined,
): string | null => {
    // Recursively find the next step that is not an intermediary node
    switch (node.type) {
        case VoiceFlowNodeType.EndCall:
            return null
        case VoiceFlowNodeType.Intermediary:
            const nextNode = getNode(node.data.next_step_id)
            if (!nextNode) return null
            return getFormTargetStepId(nextNode, getNode)
        default:
            return node.id
    }
}

export const updateTimeSplitNodeData = (
    data: TimeSplitConditionalStep,
    oldNextStepId: string | null,
    newNextStepId: string | null,
): TimeSplitConditionalStep => {
    return {
        ...data,
        on_true_step_id:
            data.on_true_step_id === oldNextStepId
                ? newNextStepId
                : data.on_true_step_id,
        on_false_step_id:
            data.on_false_step_id === oldNextStepId
                ? newNextStepId
                : data.on_false_step_id,
    } as TimeSplitConditionalStep
}

export const updateIvrMenuNodeData = (
    data: IvrMenuStep,
    oldNextStepId: string | null,
    newNextStepId: string | null,
): IvrMenuStep => {
    return {
        ...data,
        branch_options: data.branch_options.map((option: any) =>
            option.next_step_id === oldNextStepId
                ? { ...option, next_step_id: newNextStepId }
                : option,
        ),
    }
}

export const linkFormStep = (
    relatedNode: VoiceFlowNode,
    formStep: VoiceFlowNodeData | undefined,
    nextStepId: string,
): VoiceFlowNodeData | null => {
    if (!formStep) return null

    switch (formStep.step_type) {
        case VoiceFlowNodeType.CustomerLookup:
            if (relatedNode.type !== VoiceFlowNodeType.CustomerLookupOption) {
                return null
            }

            if (relatedNode.data.isDefaultOption) {
                return {
                    ...formStep,
                    default_next_step_id: nextStepId,
                }
            }

            return {
                ...formStep,
                branch_options: formStep.branch_options.map((option, index) =>
                    index === relatedNode.data.optionIndex
                        ? {
                              ...option,
                              next_step_id: nextStepId,
                          }
                        : option,
                ),
            }
        case VoiceFlowNodeType.TimeSplitConditional:
            if (relatedNode.type !== VoiceFlowNodeType.TimeSplitOption) {
                return null
            }
            return {
                ...formStep,
                on_true_step_id: relatedNode.data.isTrueBranch
                    ? nextStepId
                    : formStep.on_true_step_id,
                on_false_step_id: !relatedNode.data.isTrueBranch
                    ? nextStepId
                    : formStep.on_false_step_id,
            }
        case VoiceFlowNodeType.IvrMenu:
            if (relatedNode.type !== VoiceFlowNodeType.IvrOption) {
                return null
            }
            return {
                ...formStep,
                branch_options: formStep.branch_options.map((option, index) =>
                    index === relatedNode.data.optionIndex
                        ? {
                              ...option,
                              next_step_id: nextStepId,
                          }
                        : option,
                ),
            }
        case VoiceFlowNodeType.Enqueue:
            if (
                formStep.conditional_routing &&
                relatedNode.type !== VoiceFlowNodeType.EnqueueOption
            ) {
                return null
            }
            if (
                relatedNode.type === VoiceFlowNodeType.EnqueueOption &&
                relatedNode.data.isSkipStep
            ) {
                return {
                    ...formStep,
                    skip_step_id: nextStepId,
                }
            }
            return {
                ...formStep,
                next_step_id: nextStepId,
            }
        case VoiceFlowNodeType.SendToSMS:
        case VoiceFlowNodeType.SendToVoicemail:
            // these are final nodes, we shouldn't be updating them
            return null
        case VoiceFlowNodeType.PlayMessage:
        case VoiceFlowNodeType.ForwardToExternalNumber:
        case VoiceFlowNodeType.RouteToInternalNumber:
        default:
            return {
                ...formStep,
                next_step_id: nextStepId as any,
            }
    }
}

export const pointsToEndNode = (
    node: VoiceFlowNode | undefined,
    getNode: (id: string) => VoiceFlowNode | undefined,
): boolean => {
    if (!node) return false
    if (node.type === VoiceFlowNodeType.EndCall) {
        return true
    }
    if (node.type === VoiceFlowNodeType.Intermediary) {
        return pointsToEndNode(
            node.data.next_step_id
                ? getNode(node.data.next_step_id)
                : undefined,
            getNode,
        )
    }
    return false
}

export function updateFormFlowOnNodeDelete(
    prevFlow: CallRoutingFlow,
    nodeId: string,
    branchingSubflowNodes: string[],
    branchConnectorStepId?: string | null,
): CallRoutingFlow {
    const flow = cloneDeep(prevFlow)
    const parentSteps = getParentSteps(flow.steps, nodeId)
    const isBranchingNode = branchConnectorStepId !== undefined

    const nextStepId = isBranchingNode
        ? branchConnectorStepId!
        : getNextSteps(flow.steps, nodeId)[0]!

    /**
     * 1. if it's first step, we need to set the first step to the next step
     * 2. if parent is not branching step, we need to set the parent next_step_id to the next step
     * 3. if parent is branching step, we need to set the branch option next_step_id to the next step
     * 4. if current node is branching step, we need to remove all subflow nodes
     */

    if (isBranchingNode) {
        branchingSubflowNodes.forEach((nodeId) => {
            delete flow.steps[nodeId]
        })
    }

    if (nodeId === flow.first_step_id) {
        flow.first_step_id = nextStepId
    }

    parentSteps.forEach((parentStepId) => {
        const parentStep = flow.steps[parentStepId]

        switch (parentStep.step_type) {
            case VoiceFlowNodeType.CustomerLookup:
                parentStep.branch_options.forEach((option) => {
                    if (option.next_step_id === nodeId) {
                        option.next_step_id = nextStepId
                    }
                })

                if (parentStep.default_next_step_id === nodeId) {
                    parentStep.default_next_step_id = nextStepId
                }
                break
            case VoiceFlowNodeType.Enqueue:
                if (parentStep.next_step_id === nodeId) {
                    parentStep.next_step_id = nextStepId
                }
                if (parentStep.skip_step_id === nodeId) {
                    parentStep.skip_step_id = nextStepId
                }
                break
            case VoiceFlowNodeType.IvrMenu:
                parentStep.branch_options.forEach((option) => {
                    if (option.next_step_id === nodeId) {
                        option.next_step_id = nextStepId
                    }
                })

                break
            case VoiceFlowNodeType.TimeSplitConditional:
                if (parentStep.on_true_step_id === nodeId) {
                    parentStep.on_true_step_id = nextStepId
                }
                if (parentStep.on_false_step_id === nodeId) {
                    parentStep.on_false_step_id = nextStepId
                }
                break
            default:
                if ('next_step_id' in parentStep) {
                    parentStep.next_step_id = nextStepId
                }
                break
        }
    })

    delete flow.steps[nodeId]

    return flow
}

export const bfsFlow = (flow: CallRoutingFlow): string[] => {
    const visited: Record<string, boolean> = {}
    const queue: (string | null | undefined)[] = [flow.first_step_id]
    const result: string[] = []

    while (queue.length > 0) {
        const stepId = queue.shift()

        if (!stepId || visited[stepId]) continue

        visited[stepId] = true
        result.push(stepId)

        const nextSteps = getNextSteps(flow.steps, stepId)

        queue.push(...nextSteps)
    }

    return result
}
