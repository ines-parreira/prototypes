import { Edge } from '@xyflow/react'
import * as uuid from 'uuid'

import {
    mockEnqueueStep,
    mockForwardToExternalNumberStep,
    mockIvrMenuStep,
    mockPlayMessageStep,
    mockSendToSMSStep,
    mockSendToVoicemailStep,
    mockTimeSplitConditionalStep,
} from '@gorgias/helpdesk-mocks'
import {
    CallRoutingFlow,
    CallRoutingFlowSteps,
    EnqueueStep,
    IvrMenuStep,
    PlayMessageStep,
    TimeSplitConditionalRuleType,
    TimeSplitConditionalStep,
} from '@gorgias/helpdesk-types'

import { DEFAULT_CALLBACK_REQUESTS } from 'models/integration/constants'

import {
    END_CALL_NODE,
    INCOMING_CALL_NODE,
    VoiceFlowNodeType,
} from '../constants'
import {
    EndCallNode,
    EnqueueNode,
    EnqueueOptionNode,
    ForwardToExternalNode,
    IntermediaryNode,
    IvrMenuNode,
    IvrOptionNode,
    PlayMessageNode,
    SendToVoicemailNode,
    TimeSplitConditionalNode,
    TimeSplitOptionNode,
    VoiceFlowNode,
    VoiceFlowNodeData,
} from '../types'
import {
    addIvrOption,
    canAddNewStepOnEdge,
    createEnqueueOptionNode,
    createIvrOptionNode,
    createTimeSplitOptionNode,
    findConvergencePointsInVoiceFlow,
    generateNodeData,
    getEdgeProps,
    getFormTargetStepId,
    getNextNodes,
    getNextSteps,
    getParentSteps,
    getSourceNodes,
    isBranchingNode,
    isBranchingOption,
    isVoiceFlowStep,
    linkFormStep,
    pointsToEndNode,
    transformToReactFlowNodes,
    updateFormFlowOnNodeDelete,
    updateIvrMenuNodeData,
    updateTimeSplitNodeData,
} from '../utils'

// Mock uuid module but use original implementation by default
jest.mock('uuid', () => {
    const originalUuid = jest.requireActual('uuid')
    return {
        ...originalUuid,
        v4: jest.fn(() => originalUuid.v4()),
    }
})

describe('utils', () => {
    describe('canAddNewStepOnEdge', () => {
        const targetNode: VoiceFlowNode = {
            type: VoiceFlowNodeType.PlayMessage,
            id: '2',
            position: { x: 0, y: 0 },
            data: mockPlayMessageStep(),
        }

        it('should return false if the edge is an IVRMenu', () => {
            const sourceNode: IvrMenuNode = {
                type: VoiceFlowNodeType.IvrMenu,
                id: '1',
                position: { x: 0, y: 0 },
                data: mockIvrMenuStep(),
            }

            expect(canAddNewStepOnEdge(sourceNode, targetNode)).toBe(false)
        })

        it('should return false if the edge is a voicemail', () => {
            const edge = {
                type: VoiceFlowNodeType.SendToVoicemail,
                id: '1',
                position: { x: 0, y: 0 },
            } as SendToVoicemailNode

            expect(canAddNewStepOnEdge(edge, targetNode)).toBe(false)
        })

        it('should return false if the edge is a forward to', () => {
            const edge = {
                type: VoiceFlowNodeType.ForwardToExternalNumber,
                id: '1',
                position: { x: 0, y: 0 },
            } as ForwardToExternalNode

            expect(canAddNewStepOnEdge(edge, targetNode)).toBe(false)
        })

        it('should return true if the edge is not an IVRMenu', () => {
            const sourceNode: EndCallNode = {
                type: VoiceFlowNodeType.EndCall,
                id: '1',
                position: { x: 0, y: 0 },
                data: {},
            }

            expect(canAddNewStepOnEdge(sourceNode, targetNode)).toBe(true)
        })

        it('should return false if the source is an Enqueue and the target is an EnqueueOption', () => {
            const sourceNode: EnqueueNode = {
                type: VoiceFlowNodeType.Enqueue,
                id: '1',
                position: { x: 0, y: 0 },
                data: mockEnqueueStep(),
            }

            const targetNode: EnqueueOptionNode = {
                type: VoiceFlowNodeType.EnqueueOption,
                id: '2',
                position: { x: 0, y: 0 },
                data: {} as any,
            }

            expect(canAddNewStepOnEdge(sourceNode, targetNode)).toBe(false)
        })

        it('should return true if the source is an Enqueue and the target is not an EnqueueOption', () => {
            const sourceNode: EnqueueNode = {
                type: VoiceFlowNodeType.Enqueue,
                id: '1',
                position: { x: 0, y: 0 },
                data: mockEnqueueStep(),
            }

            expect(canAddNewStepOnEdge(sourceNode, targetNode)).toBe(true)
        })
    })

    describe('isVoiceFlowStep', () => {
        it('should return false if the step is not a valid VoiceFlowNodeType', () => {
            expect(isVoiceFlowStep('invalid')).toBe(false)
        })
    })

    describe('getNextNodes', () => {
        it('should return the next nodes for an Enqueue with conditional routing', () => {
            const node: EnqueueNode = {
                type: VoiceFlowNodeType.Enqueue,
                id: '1',
                position: { x: 0, y: 0 },
                data: mockEnqueueStep({
                    conditional_routing: true,
                    next_step_id: '2',
                    skip_step_id: '3',
                }),
            }

            expect(getNextNodes(node, [])).toEqual(['2', '3'])
        })

        it('should return the next nodes for an Enqueue without conditional routing', () => {
            const node: EnqueueNode = {
                type: VoiceFlowNodeType.Enqueue,
                id: '1',
                position: { x: 0, y: 0 },
                data: mockEnqueueStep({
                    conditional_routing: false,
                    next_step_id: '2',
                }),
            }

            expect(getNextNodes(node, [])).toEqual(['2'])
        })

        it('should return the next nodes for a time split conditional', () => {
            const node: TimeSplitConditionalNode = {
                type: VoiceFlowNodeType.TimeSplitConditional,
                id: '1',
                position: { x: 0, y: 0 },
                data: mockTimeSplitConditionalStep(),
            }

            expect(getNextNodes(node, [])).toEqual([
                node.data.on_true_step_id,
                node.data.on_false_step_id,
            ])
        })

        it('should return the next nodes for an IVRMenu', () => {
            const node: IvrMenuNode = {
                type: VoiceFlowNodeType.IvrMenu,
                id: '1',
                position: { x: 0, y: 0 },
                data: mockIvrMenuStep({
                    branch_options: [
                        {
                            input_digit: '1',
                            next_step_id: '2',
                        },
                        {
                            input_digit: '2',
                            next_step_id: '3',
                        },
                    ],
                }),
            }

            const nodes: IvrOptionNode[] = [
                {
                    type: VoiceFlowNodeType.IvrOption,
                    id: '2',
                    position: { x: 0, y: 0 },
                    data: {
                        parentId: node.id,
                        optionIndex: 0,
                        next_step_id: '2',
                    },
                },
                {
                    type: VoiceFlowNodeType.IvrOption,
                    id: '3',
                    position: { x: 0, y: 0 },
                    data: {
                        parentId: node.id,
                        optionIndex: 1,
                        next_step_id: '3',
                    },
                },
            ]

            expect(getNextNodes(node, nodes)).toEqual(['2', '3'])
        })
    })

    describe('createIvrOptionNode', () => {
        it('should create an IVR option node', () => {
            const ivrMenuNode: IvrMenuNode = {
                type: VoiceFlowNodeType.IvrMenu,
                id: '1',
                position: { x: 0, y: 0 },
                data: mockIvrMenuStep(),
            }

            const node = createIvrOptionNode(
                ivrMenuNode.id,
                0,
                ivrMenuNode.data.branch_options[0].next_step_id,
            )

            expect(node).toEqual({
                id: expect.any(String),
                type: VoiceFlowNodeType.IvrOption,
                data: {
                    parentId: ivrMenuNode.id,
                    optionIndex: 0,
                    next_step_id:
                        ivrMenuNode.data.branch_options[0].next_step_id,
                },
            })
        })
    })

    describe('createEnqueueOptionNode', () => {
        it('should create an Enqueue option node', () => {
            const enqueueNodeSkipStep = createEnqueueOptionNode('1', true, '2')
            const enqueueNodeDefaultStep = createEnqueueOptionNode(
                '1',
                false,
                '2',
            )

            expect(enqueueNodeSkipStep).toEqual({
                id: expect.any(String),
                type: VoiceFlowNodeType.EnqueueOption,
                data: {
                    parentId: '1',
                    isSkipStep: true,
                    next_step_id: '2',
                },
            })

            expect(enqueueNodeDefaultStep).toEqual({
                id: expect.any(String),
                type: VoiceFlowNodeType.EnqueueOption,
                data: {
                    parentId: '1',
                    isSkipStep: false,
                    next_step_id: '2',
                },
            })
        })
    })

    describe('createTimeSplitOptionNode', () => {
        it('should create a time split option node', () => {
            const timeSplitConditionalNode: TimeSplitConditionalNode = {
                type: VoiceFlowNodeType.TimeSplitConditional,
                id: '1',
                position: { x: 0, y: 0 },
                data: mockTimeSplitConditionalStep(),
            }

            const node = createTimeSplitOptionNode(
                timeSplitConditionalNode,
                timeSplitConditionalNode.data.on_true_step_id,
                true,
            )

            expect(node).toEqual({
                id: expect.any(String),
                type: VoiceFlowNodeType.TimeSplitOption,
                data: {
                    parentId: timeSplitConditionalNode.id,
                    next_step_id: timeSplitConditionalNode.data.on_true_step_id,
                    isTrueBranch: true,
                },
            })
        })
    })

    describe('transformToReactFlowNodes', () => {
        it('should transform a voice flow with IVR and time split nodes to react flow nodes', () => {
            /**
             * flow example: play message -> ivr menu with 2 options: opt1 and opt2
             * opt1 -> play message 2 -> END CALL
             * opt2 -> time split conditional with 2 options: inside and outside
             * inside -> play message 3 -> END CALL
             * outside -> voicemail -> END CALL
             */
            const playMessageNodeStart = mockPlayMessageStep({
                next_step_id: 'ivr_menu',
            })
            const ivrMenuNode = mockIvrMenuStep({
                branch_options: [
                    {
                        input_digit: '1',
                        next_step_id: 'play_message_2',
                    },
                    {
                        input_digit: '2',
                        next_step_id: 'time_split_conditional',
                    },
                ],
            })
            const playMessageNode2 = mockPlayMessageStep({
                next_step_id: null,
            })
            const playMessageNode3 = mockPlayMessageStep({
                next_step_id: null,
            })
            const timeSplitConditionalNode = mockTimeSplitConditionalStep({
                on_true_step_id: 'play_message_3',
                on_false_step_id: 'voicemail',
            })
            const voicemailNode = mockSendToVoicemailStep({
                next_step_id: null,
            })
            const flow: CallRoutingFlow = {
                first_step_id: 'play_message_start',
                steps: {
                    play_message_start: playMessageNodeStart,
                    ivr_menu: ivrMenuNode,
                    play_message_2: playMessageNode2,
                    time_split_conditional: timeSplitConditionalNode,
                    play_message_3: playMessageNode3,
                    voicemail: voicemailNode,
                },
            }

            const nodes = transformToReactFlowNodes(flow)

            const expectedNodes = [
                {
                    ...INCOMING_CALL_NODE,
                    data: {
                        next_step_id: 'play_message_start',
                    },
                },
                {
                    id: 'play_message_start',
                    type: VoiceFlowNodeType.PlayMessage,
                    data: playMessageNodeStart,
                    selected: false,
                },
                {
                    id: 'ivr_menu',
                    type: VoiceFlowNodeType.IvrMenu,
                    data: {
                        ...ivrMenuNode,
                        branch_options: expect.arrayContaining([
                            expect.objectContaining({
                                next_step_id:
                                    expect.not.stringMatching('play_message_2'),
                            }),
                        ]),
                    },
                    selected: false,
                },
                {
                    id: expect.any(String),
                    type: VoiceFlowNodeType.IvrOption,
                    data: {
                        parentId: 'ivr_menu',
                        optionIndex: 0,
                        next_step_id: 'play_message_2',
                    },
                },
                {
                    id: expect.any(String),
                    type: VoiceFlowNodeType.IvrOption,
                    data: {
                        parentId: 'ivr_menu',
                        optionIndex: 1,
                        next_step_id: 'time_split_conditional',
                    },
                },
                {
                    id: 'play_message_2',
                    type: VoiceFlowNodeType.PlayMessage,
                    data: {
                        ...playMessageNode2,
                        // intermediary node, not the same id as in the step
                        next_step_id: expect.not.stringMatching(
                            END_CALL_NODE.id,
                        ),
                    },
                    selected: false,
                },
                {
                    id: 'time_split_conditional',
                    type: VoiceFlowNodeType.TimeSplitConditional,
                    data: {
                        ...timeSplitConditionalNode,
                        on_true_step_id: expect.not.stringMatching(
                            timeSplitConditionalNode.on_true_step_id,
                        ),
                        on_false_step_id: expect.not.stringMatching(
                            timeSplitConditionalNode.on_false_step_id,
                        ),
                    },
                    selected: false,
                },
                {
                    id: expect.any(String),
                    type: VoiceFlowNodeType.TimeSplitOption,
                    data: {
                        parentId: 'time_split_conditional',
                        next_step_id: 'play_message_3',
                        isTrueBranch: true,
                    },
                },
                {
                    id: expect.any(String),
                    type: VoiceFlowNodeType.TimeSplitOption,
                    data: {
                        parentId: 'time_split_conditional',
                        next_step_id: 'voicemail',
                        isTrueBranch: false,
                    },
                },
                {
                    id: 'play_message_3',
                    type: VoiceFlowNodeType.PlayMessage,
                    data: {
                        ...playMessageNode3,
                        // intermediary node, not the same id as in the step
                        next_step_id: expect.not.stringMatching(
                            END_CALL_NODE.id,
                        ),
                    },
                    selected: false,
                },
                {
                    id: 'voicemail',
                    type: VoiceFlowNodeType.SendToVoicemail,
                    data: {
                        ...voicemailNode,
                        // intermediary node, not the same id as in the step
                        next_step_id: expect.not.stringMatching(
                            END_CALL_NODE.id,
                        ),
                    },
                    selected: false,
                },
                {
                    ...END_CALL_NODE,
                },
                {
                    data: {
                        next_step_id: 'end_call',
                    },
                    id: expect.any(String),
                    position: {
                        x: 0,
                        y: 0,
                    },
                    type: VoiceFlowNodeType.Intermediary,
                },
                {
                    data: {
                        next_step_id: expect.any(String),
                    },
                    id: expect.any(String),
                    position: {
                        x: 0,
                        y: 0,
                    },
                    type: VoiceFlowNodeType.Intermediary,
                },
            ]

            expect(nodes).toEqual(
                expectedNodes.map((node) => ({
                    ...node,
                    position: { x: 0, y: 0 },
                })),
            )

            // check intermediary nodes links
            const intermediaryNodes = nodes.filter(
                (node) => node.type === VoiceFlowNodeType.Intermediary,
            )
            const intermediaryNode1 = intermediaryNodes[0] as IntermediaryNode
            const intermediaryNode2 = intermediaryNodes[1] as IntermediaryNode

            // check options from ivr menu point to intermediary node 2
            ;['play_message_3', 'voicemail'].forEach((id) => {
                const convergingNode = nodes.find((node) => node.id === id)
                expect(convergingNode).toBeDefined()
                expect((convergingNode as any).data.next_step_id).toBe(
                    intermediaryNode2.id,
                )
            })
            // check play message 2 and intermediary node 2 to intermediary node 1
            ;['play_message_2', intermediaryNode2.id].forEach((id) => {
                const convergingNode = nodes.find((node) => node.id === id)
                expect(convergingNode).toBeDefined()
                expect((convergingNode as any).data.next_step_id).toBe(
                    intermediaryNode1.id,
                )
            })
        })

        it('should transform a complex voice flow with multi-IVR and time split nodes to react flow nodes', () => {
            /**
             * flow example: play message -> time rule
             * outside business hours -> voicemail
             * inside business hours -> IVR menu 1 with 3 options: opt1, opt2 and opt3
             *   opt1 -> play message 2 -> send to sms -> END call
             *   opt2 -> time rule 2
             *      -> inside -> time rule 3
             *          -> inside -> send to sms -> END CALL
             *          -> outside -> send to sms -> END CALL
             *      -> outside -> send to sms -> END CALL
             *   opt3 inside -> IVR menu 2
             *      -> option 1 -> IVR menu 3
             *           -> option 1 -> send to sms -> END CALL
             *           -> option 2 -> send to sms -> END CALL
             *      -> option 2 -> send to sms -> END CALL
             *      -> option 3 -> send to sms -> END CALL
             *
             *  We check for intermediary nodes created for:
             *      * time_rule_1
             *      * time_rule_2
             *      * time_rule_3
             *      * ivr_menu_1
             *      * ivr_menu_2
             *      * ivr_menu_3
             */
            const playMessageNodeStart = mockPlayMessageStep({
                id: 'play_message_start',
                next_step_id: 'time_rule_1',
            })
            const timeRuleNode1 = mockTimeSplitConditionalStep({
                id: 'time_rule_1',
                on_true_step_id: 'ivr_menu_1',
                on_false_step_id: 'voicemail',
            })
            const voicemail = mockSendToVoicemailStep({ id: 'voicemail' })
            const ivrMenuNode1 = mockIvrMenuStep({
                id: 'ivr_menu_1',
                branch_options: [
                    {
                        input_digit: '1',
                        next_step_id: 'play_message_2',
                    },
                    {
                        input_digit: '2',
                        next_step_id: 'time_rule_2',
                    },
                    {
                        input_digit: '3',
                        next_step_id: 'ivr_menu_2',
                    },
                ],
            })
            const playMessageNode2 = mockPlayMessageStep({
                id: 'play_message_2',
                next_step_id: 'send_to_sms',
            })
            const timeRuleNode2 = mockTimeSplitConditionalStep({
                id: 'time_rule_2',
                on_true_step_id: 'time_rule_3',
                on_false_step_id: 'send_to_sms',
            })
            const timeRuleNode3 = mockTimeSplitConditionalStep({
                id: 'time_rule_3',
                on_true_step_id: 'send_to_sms',
                on_false_step_id: 'send_to_sms',
            })
            const ivrMenuNode2 = mockIvrMenuStep({
                id: 'ivr_menu_2',
                branch_options: [
                    {
                        input_digit: '1',
                        next_step_id: 'ivr_menu_3',
                    },
                    {
                        input_digit: '2',
                        next_step_id: 'send_to_sms',
                    },
                ],
            })
            const ivrMenuNode3 = mockIvrMenuStep({
                id: 'ivr_menu_3',
                branch_options: [
                    {
                        input_digit: '1',
                        next_step_id: 'send_to_sms',
                    },
                    {
                        input_digit: '2',
                        next_step_id: 'send_to_sms',
                    },
                    {
                        input_digit: '3',
                        next_step_id: 'send_to_sms',
                    },
                ],
            })
            const sendToSmsNode = mockSendToSMSStep({
                id: 'send_to_sms',
                next_step_id: null,
            })
            const flow: CallRoutingFlow = {
                first_step_id: 'play_message_start',
                steps: {
                    play_message_start: playMessageNodeStart,
                    time_rule_1: timeRuleNode1,
                    voicemail: voicemail,
                    ivr_menu_1: ivrMenuNode1,
                    play_message_2: playMessageNode2,
                    time_rule_2: timeRuleNode2,
                    time_rule_3: timeRuleNode3,
                    send_to_sms: sendToSmsNode,
                    ivr_menu_2: ivrMenuNode2,
                    ivr_menu_3: ivrMenuNode3,
                },
            }

            const nodes = transformToReactFlowNodes(flow)

            // check intermediary nodes links
            const intermediaryNodes = nodes.filter(
                (node) => node.type === VoiceFlowNodeType.Intermediary,
            )
            expect(intermediaryNodes).toHaveLength(6)
        })

        it('should transform a simple enqueue node with conditional routing', () => {
            const enqueueNode = mockEnqueueStep({
                id: 'enqueue',
                conditional_routing: true,
                next_step_id: null,
                skip_step_id: null,
            })

            const flow: CallRoutingFlow = {
                first_step_id: 'enqueue',
                steps: { enqueue: enqueueNode },
            }

            const nodes = transformToReactFlowNodes(flow)

            expect(nodes).toEqual([
                expect.objectContaining({
                    ...INCOMING_CALL_NODE,
                    data: { next_step_id: 'enqueue' },
                }),
                expect.objectContaining({
                    id: enqueueNode.id,
                    data: {
                        ...enqueueNode,
                        next_step_id: expect.not.stringMatching(
                            END_CALL_NODE.id,
                        ),
                        skip_step_id: expect.not.stringMatching(
                            END_CALL_NODE.id,
                        ),
                    },
                }),
                expect.objectContaining({
                    type: VoiceFlowNodeType.EnqueueOption,
                    data: {
                        parentId: enqueueNode.id,
                        isSkipStep: true,
                        next_step_id: expect.not.stringMatching(
                            END_CALL_NODE.id,
                        ),
                    },
                }),
                expect.objectContaining({
                    type: VoiceFlowNodeType.EnqueueOption,
                    data: {
                        parentId: enqueueNode.id,
                        isSkipStep: false,
                        next_step_id: expect.not.stringMatching(
                            END_CALL_NODE.id,
                        ),
                    },
                }),
                expect.objectContaining({ ...END_CALL_NODE }),
                expect.objectContaining({
                    type: VoiceFlowNodeType.Intermediary,
                    data: expect.objectContaining({
                        next_step_id: END_CALL_NODE.id,
                    }),
                }),
            ])
        })

        it('should transform a simple enqueue node without conditional routing', () => {
            const enqueueNode = mockEnqueueStep({
                id: 'enqueue',
                conditional_routing: false,
                next_step_id: 'end-call',
            })

            const flow: CallRoutingFlow = {
                first_step_id: 'enqueue',
                steps: { enqueue: enqueueNode },
            }

            const nodes = transformToReactFlowNodes(flow)

            expect(nodes).toEqual([
                expect.objectContaining({
                    ...INCOMING_CALL_NODE,
                    data: { next_step_id: 'enqueue' },
                }),
                expect.objectContaining({
                    id: enqueueNode.id,
                    data: {
                        ...enqueueNode,
                        next_step_id: 'end-call',
                    },
                }),
                expect.objectContaining({ ...END_CALL_NODE }),
            ])
        })
    })

    describe('findConvergencePointsInVoiceFlow', () => {
        const linearFlowNodes = [
            {
                id: 'incoming-call',
                type: VoiceFlowNodeType.IncomingCall,
                data: { next_step_id: 'welcome' },
                position: { x: 0, y: 0 },
            },
            {
                id: 'welcome',
                type: VoiceFlowNodeType.PlayMessage,
                data: { next_step_id: 'enqueue' },
                position: { x: 0, y: 0 },
            },
            {
                id: 'enqueue',
                type: VoiceFlowNodeType.Enqueue,
                data: { next_step_id: 'end-call' },
                position: { x: 0, y: 0 },
            },
            {
                id: 'end-call',
                type: VoiceFlowNodeType.EndCall,
                data: {},
                position: { x: 0, y: 0 },
            },
        ] as VoiceFlowNode[]

        const ivrMenuNodes = [
            {
                id: 'incoming-call',
                type: VoiceFlowNodeType.IncomingCall,
                data: { next_step_id: 'ivr-menu' },
                position: { x: 0, y: 0 },
            },
            {
                id: 'ivr-menu',
                type: VoiceFlowNodeType.IvrMenu,
                data: {
                    branch_options: [
                        { input_digit: '1', next_step_id: 'option-1' },
                        { input_digit: '2', next_step_id: 'option-2' },
                    ],
                },
                position: { x: 0, y: 0 },
            },
            {
                id: 'option-1',
                type: VoiceFlowNodeType.IvrOption,
                data: {
                    parentId: 'ivr-menu',
                    optionsIndex: 0,
                    next_step_id: 'play-message-1',
                },
                position: { x: 0, y: 0 },
            },
            {
                id: 'option-2',
                type: VoiceFlowNodeType.IvrOption,
                data: {
                    parentId: 'ivr-menu',
                    optionIndex: 1,
                    next_step_id: 'play-message-2',
                },
                position: { x: 0, y: 0 },
            },
            {
                id: 'play-message-1',
                type: VoiceFlowNodeType.PlayMessage,
                data: { next_step_id: 'end-call' },
                position: { x: 0, y: 0 },
            },
            {
                id: 'play-message-2',
                type: VoiceFlowNodeType.PlayMessage,
                data: { next_step_id: 'end-call' },
                position: { x: 0, y: 0 },
            },
            {
                id: 'end-call',
                type: VoiceFlowNodeType.EndCall,
                data: {},
                position: { x: 0, y: 0 },
            },
        ] as VoiceFlowNode[]

        it('should return empty array for empty incoming edges map', () => {
            const result = findConvergencePointsInVoiceFlow([])
            expect(result).toEqual([])
        })

        it('should find no convergence in a linear flow', () => {
            const result = findConvergencePointsInVoiceFlow(linearFlowNodes)

            expect(result).toEqual([])
        })

        it('should find one convergence point in a branched flow', () => {
            const result = findConvergencePointsInVoiceFlow(ivrMenuNodes)

            expect(result).toEqual([
                {
                    targetNodeId: 'end-call',
                    convergingNodes: ['play-message-1', 'play-message-2'],
                },
            ])
        })

        it('should exclude intermediary nodes from convergence points', () => {
            const nodes = ivrMenuNodes.map((node) => {
                if (node.type === VoiceFlowNodeType.PlayMessage) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            next_step_id: 'intermediary-node',
                        },
                    }
                }
                return node
            })
            nodes.push({
                id: 'intermediary-node',
                type: VoiceFlowNodeType.Intermediary,
                data: {
                    next_step_id: 'end-call',
                },
                position: { x: 0, y: 0 },
            })
            const result = findConvergencePointsInVoiceFlow(nodes)

            expect(result).toEqual([])
        })
    })

    describe('getEdgeProps', () => {
        it('should return branching edge props for Enqueue with conditional routing', () => {
            const edge: Edge = {
                id: 'edge1',
                source: 'node',
                target: 'target-node',
            }

            const nodes: VoiceFlowNode[] = [
                {
                    id: edge.source,
                    type: VoiceFlowNodeType.Enqueue,
                    data: mockEnqueueStep({ conditional_routing: true }),
                    position: { x: 0, y: 0 },
                } as VoiceFlowNode,
            ]

            const result = getEdgeProps(edge, nodes)

            expect(result).toEqual({ weight: 50, height: 12 })
        })

        it('should return default edge props for Enqueue without conditional routing', () => {
            const edge: Edge = {
                id: 'edge1',
                source: 'node',
                target: 'target-node',
            }

            const nodes: VoiceFlowNode[] = [
                {
                    id: edge.source,
                    type: VoiceFlowNodeType.Enqueue,
                    data: mockEnqueueStep({ conditional_routing: false }),
                    position: { x: 0, y: 0 },
                } as VoiceFlowNode,
            ]

            const result = getEdgeProps(edge, nodes)
            expect(result).toEqual({ weight: 1, height: 24 })
        })

        it.each([
            VoiceFlowNodeType.IvrMenu,
            VoiceFlowNodeType.TimeSplitConditional,
        ])('should return short edge props for %s source', (type) => {
            const edge: Edge = {
                id: 'edge1',
                source: 'node',
                target: 'target-node',
            }
            const nodes: VoiceFlowNode[] = [
                {
                    id: edge.source,
                    type,
                    position: { x: 0, y: 0 },
                } as VoiceFlowNode,
            ]

            const result = getEdgeProps(edge, nodes)

            expect(result).toEqual({ weight: 50, height: 12 })
        })

        it.each([
            VoiceFlowNodeType.IvrOption,
            VoiceFlowNodeType.TimeSplitOption,
            VoiceFlowNodeType.EnqueueOption,
        ])('should return short edge props for %s source', (type) => {
            const edge: Edge = {
                id: 'edge1',
                source: 'node',
                target: 'target-node',
            }
            const nodes: VoiceFlowNode[] = [
                {
                    id: edge.source,
                    type,
                    position: { x: 0, y: 0 },
                } as VoiceFlowNode,
            ]

            const result = getEdgeProps(edge, nodes)

            expect(result).toEqual({ weight: 45, height: 24 })
        })

        it('should return default edge props for PlayMessage source', () => {
            const edge: Edge = {
                id: 'edge1',
                source: 'play-message-node',
                target: 'target-node',
            }
            const nodes: VoiceFlowNode[] = [
                {
                    id: 'play-message-node',
                    type: VoiceFlowNodeType.PlayMessage,
                    data: mockPlayMessageStep(),
                    position: { x: 0, y: 0 },
                } as PlayMessageNode,
            ]

            const result = getEdgeProps(edge, nodes)

            expect(result).toEqual({ weight: 1, height: 24 })
        })

        it('should return default edge props when source node is not found', () => {
            const edge: Edge = {
                id: 'edge1',
                source: 'non-existent-node',
                target: 'target-node',
            }
            const nodes: VoiceFlowNode[] = []

            const result = getEdgeProps(edge, nodes)

            expect(result).toEqual({ weight: 1, height: 24 })
        })
    })

    describe('isBranchingOption', () => {
        it('should return true for IvrOption node', () => {
            const node: IvrOptionNode = {
                type: VoiceFlowNodeType.IvrOption,
                id: '1',
                position: { x: 0, y: 0 },
                data: {
                    parentId: 'parent-1',
                    optionIndex: 0,
                    next_step_id: '2',
                },
            }

            expect(isBranchingOption(node)).toBe(true)
        })

        it('should return true for TimeSplitConditional node', () => {
            const node: TimeSplitOptionNode = {
                type: VoiceFlowNodeType.TimeSplitOption,
                id: '1',
                position: { x: 0, y: 0 },
                data: {
                    isTrueBranch: true,
                    parentId: 'parent-1',
                    next_step_id: '2',
                },
            }

            expect(isBranchingOption(node)).toBe(true)
        })

        it('should return true for EnqueueOption node', () => {
            const node: EnqueueOptionNode = {
                type: VoiceFlowNodeType.EnqueueOption,
                id: '1',
                position: { x: 0, y: 0 },
                data: {
                    parentId: '1',
                    isSkipStep: true,
                    next_step_id: '2',
                },
            }

            expect(isBranchingOption(node)).toBe(true)
        })

        it('should return false for PlayMessage node', () => {
            const node: PlayMessageNode = {
                type: VoiceFlowNodeType.PlayMessage,
                id: '1',
                position: { x: 0, y: 0 },
                data: mockPlayMessageStep(),
            }

            expect(isBranchingOption(node)).toBe(false)
        })
    })

    describe('isBranchingNode', () => {
        it.each([
            {
                type: VoiceFlowNodeType.IvrMenu,
                data: mockIvrMenuStep(),
                expected: true,
            },
            {
                type: VoiceFlowNodeType.TimeSplitConditional,
                data: mockTimeSplitConditionalStep(),
                expected: true,
            },
            {
                type: VoiceFlowNodeType.Enqueue,
                data: mockEnqueueStep({ conditional_routing: true }),
                expected: true,
            },
            {
                type: VoiceFlowNodeType.Enqueue,
                data: mockEnqueueStep({ conditional_routing: false }),
                expected: false,
            },
            {
                type: VoiceFlowNodeType.PlayMessage,
                data: mockPlayMessageStep(),
                expected: false,
            },
        ])('should return true for %s node', ({ type, data, expected }) => {
            const node = {
                type,
                id: '1',
                position: { x: 0, y: 0 },
                data,
            }
            expect(isBranchingNode(node)).toBe(expected)
        })
    })

    describe('generateNodeData', () => {
        it('should generate TimeSplitConditional node data', () => {
            const nodeData = generateNodeData(
                VoiceFlowNodeType.TimeSplitConditional,
                'next-step-id',
            )

            expect(nodeData).toMatchObject({
                name: 'Time rule',
                step_type: VoiceFlowNodeType.TimeSplitConditional,
                on_true_step_id: 'next-step-id',
                on_false_step_id: 'next-step-id',
                rule_type: TimeSplitConditionalRuleType.BusinessHours,
            })
            expect(nodeData?.id).toBeDefined()
        })

        it('should generate IvrMenu node data', () => {
            const nodeData = generateNodeData(
                VoiceFlowNodeType.IvrMenu,
                'next-step-id',
            )

            expect(nodeData).toMatchObject({
                name: 'IVR Menu',
                step_type: VoiceFlowNodeType.IvrMenu,
                branch_options: [
                    {
                        input_digit: '1',
                        next_step_id: 'next-step-id',
                    },
                    {
                        input_digit: '2',
                        next_step_id: 'next-step-id',
                    },
                ],
                message: {
                    voice_message_type: 'text_to_speech',
                    text_to_speech_content: '',
                },
            })
        })

        it('should generate PlayMessage node data', () => {
            const nodeData = generateNodeData(
                VoiceFlowNodeType.PlayMessage,
                'next-step-id',
            )

            expect(nodeData).toMatchObject({
                name: 'Play message',
                step_type: VoiceFlowNodeType.PlayMessage,
                message: {
                    voice_message_type: 'text_to_speech',
                },
                next_step_id: 'next-step-id',
            })
            expect(nodeData?.id).toBeDefined()
        })

        it('should generate SendToVoicemail node data', () => {
            const nodeData = generateNodeData(
                VoiceFlowNodeType.SendToVoicemail,
                'testing-id',
            )

            expect(nodeData).toMatchObject({
                name: 'Send to voicemail',
                step_type: VoiceFlowNodeType.SendToVoicemail,
                voicemail: {
                    voice_message_type: 'text_to_speech',
                    text_to_speech_content: expect.any(String),
                },
                allow_to_leave_voicemail: true,
                next_step_id: null,
            })
            expect(nodeData?.id).toBeDefined()
        })

        it('should generate SendToSMS node data', () => {
            const nodeData = generateNodeData(
                VoiceFlowNodeType.SendToSMS,
                'testing-id',
            )

            expect(nodeData).toMatchObject({
                name: 'Send to SMS',
                step_type: VoiceFlowNodeType.SendToSMS,
                confirmation_message: {
                    voice_message_type: 'text_to_speech',
                    text_to_speech_content:
                        "Thank you for contacting us! We're moving to text messaging now, you’ll receive our message shortly.",
                },
                sms_content:
                    "Hello! We're following up on your call. How can we assist you today?",
                next_step_id: null,
            })
            expect(nodeData?.id).toBeDefined()
        })

        it('should generate Enqueue node data', () => {
            const nodeData = generateNodeData(
                VoiceFlowNodeType.Enqueue,
                'testing-id',
            )

            expect(nodeData).toMatchObject({
                name: 'Route to',
                step_type: VoiceFlowNodeType.Enqueue,
                callback_requests: DEFAULT_CALLBACK_REQUESTS,
                conditional_routing: false,
                next_step_id: 'testing-id',
            })
            expect(nodeData?.id).toBeDefined()
        })

        it('should generate ForwardToExternal node data', () => {
            const nodeData = generateNodeData(
                VoiceFlowNodeType.ForwardToExternalNumber,
                'testing-id',
            )

            expect(nodeData).toMatchObject({
                name: 'Forward to',
                step_type: VoiceFlowNodeType.ForwardToExternalNumber,
                external_number: '',
                next_step_id: null,
            })
            expect(nodeData?.id).toBeDefined()
        })

        it('should return null for unsupported node types', () => {
            const nodeData = generateNodeData(
                VoiceFlowNodeType.IvrOption,
                'next-step-id',
            )

            expect(nodeData).toBeNull()
        })
    })

    describe('getSourceNodes', () => {
        const mockNodes: VoiceFlowNode[] = [
            {
                id: 'incoming',
                type: VoiceFlowNodeType.IncomingCall,
                data: { next_step_id: 'node-1' },
                position: { x: 0, y: 0 },
            },
            {
                id: 'node-1',
                type: VoiceFlowNodeType.PlayMessage,
                data: {
                    id: 'node-1',
                    step_type: VoiceFlowNodeType.PlayMessage,
                    name: 'Play message',
                    message: {
                        voice_message_type: 'text_to_speech',
                        text_to_speech_content: 'Hello',
                    },
                    next_step_id: 'intermediary-1',
                },
                position: { x: 0, y: 0 },
            },
            {
                id: 'node-2',
                type: VoiceFlowNodeType.PlayMessage,
                data: {
                    id: 'node-2',
                    step_type: VoiceFlowNodeType.PlayMessage,
                    name: 'Play message',
                    message: {
                        voice_message_type: 'text_to_speech',
                        text_to_speech_content: 'Hi again',
                    },
                    next_step_id: 'intermediary-1',
                },
                position: { x: 0, y: 0 },
            },
            {
                id: 'intermediary-1',
                type: VoiceFlowNodeType.Intermediary,
                data: {
                    next_step_id: 'node-3',
                },
                position: { x: 0, y: 0 },
            } as IntermediaryNode,
            {
                id: 'node-3',
                type: VoiceFlowNodeType.EndCall,
                data: {},
                position: { x: 0, y: 0 },
            },
        ]

        it('should return empty array for IncomingCall node', () => {
            const sourceNodes = getSourceNodes(mockNodes[0], mockNodes)

            expect(sourceNodes).toEqual([])
        })

        it('should return the node itself if not intermediary or incoming call', () => {
            const sourceNodes = getSourceNodes(mockNodes[1], mockNodes)

            expect(sourceNodes).toEqual([mockNodes[1]])
        })

        it('should return source nodes for intermediary node', () => {
            const sourceNodes = getSourceNodes(mockNodes[3], mockNodes)

            expect(sourceNodes).toHaveLength(2)
            expect(sourceNodes).toContainEqual(mockNodes[1])
            expect(sourceNodes).toContainEqual(mockNodes[2])
        })

        it('should handle EndCall nodes', () => {
            const mockNodes: VoiceFlowNode[] = [
                {
                    id: 'end-call',
                    type: VoiceFlowNodeType.EndCall,
                    data: {},
                    position: { x: 0, y: 0 },
                },
            ]

            const sourceNodes = getSourceNodes(mockNodes[0], mockNodes)

            expect(sourceNodes).toEqual([mockNodes[0]])
        })
    })

    describe('linkFormStep', () => {
        it('should update TimeSplitConditional true branch', () => {
            const relatedNode: TimeSplitOptionNode = {
                id: 'option-1',
                type: VoiceFlowNodeType.TimeSplitOption,
                data: {
                    parentId: 'time-split-1',
                    next_step_id: 'old-id',
                    isTrueBranch: true,
                },
                position: { x: 0, y: 0 },
            }

            const formStep = {
                id: 'time-split-1',
                step_type: VoiceFlowNodeType.TimeSplitConditional,
                name: 'Time rule',
                on_true_step_id: 'old-id',
                on_false_step_id: 'other-id',
            } as TimeSplitConditionalStep

            const updated = linkFormStep(
                relatedNode,
                formStep,
                'new-id',
            ) as TimeSplitConditionalStep

            expect(updated?.on_true_step_id).toBe('new-id')
            expect(updated?.on_false_step_id).toBe('other-id')
        })

        it('should update TimeSplitConditional false branch', () => {
            const relatedNode: TimeSplitOptionNode = {
                id: 'option-2',
                type: VoiceFlowNodeType.TimeSplitOption,
                data: {
                    parentId: 'time-split-1',
                    next_step_id: 'old-id',
                    isTrueBranch: false,
                },
                position: { x: 0, y: 0 },
            }

            const formStep = {
                id: 'time-split-1',
                step_type: VoiceFlowNodeType.TimeSplitConditional,
                name: 'Time rule',
                on_true_step_id: 'other-id',
                on_false_step_id: 'old-id',
            } as TimeSplitConditionalStep

            const updated = linkFormStep(
                relatedNode,
                formStep,
                'new-id',
            ) as TimeSplitConditionalStep

            expect(updated?.on_true_step_id).toBe('other-id')
            expect(updated?.on_false_step_id).toBe('new-id')
        })

        it('should update EnqueueOption skip step branch', () => {
            const relatedNode: EnqueueOptionNode = {
                id: 'enqueue-option-1',
                type: VoiceFlowNodeType.EnqueueOption,
                data: {
                    parentId: 'enqueue-1',
                    isSkipStep: true,
                    next_step_id: 'old-id',
                },
                position: { x: 0, y: 0 },
            }

            const formStep = mockEnqueueStep({
                next_step_id: 'old-id',
                conditional_routing: true,
            })

            const updated = linkFormStep(
                relatedNode,
                formStep,
                'new-id',
            ) as EnqueueStep

            expect(updated?.skip_step_id).toBe('new-id')
            expect(updated?.next_step_id).toBe('old-id')
        })

        it('should update EnqueueOption default step branch', () => {
            const relatedNode: EnqueueOptionNode = {
                id: 'enqueue-option-1',
                type: VoiceFlowNodeType.EnqueueOption,
                data: {
                    parentId: 'enqueue-1',
                    isSkipStep: false,
                    next_step_id: 'old-id',
                },
                position: { x: 0, y: 0 },
            }
            const formStep = mockEnqueueStep({
                next_step_id: 'old-id',
                conditional_routing: true,
                skip_step_id: 'skip-id',
            })

            const updated = linkFormStep(
                relatedNode,
                formStep,
                'new-id',
            ) as EnqueueStep

            expect(updated?.next_step_id).toBe('new-id')
            expect(updated?.skip_step_id).toBe('skip-id')
        })

        it('should update Enqueue next_step_id when conditional routing is false', () => {
            const relatedNode: EnqueueNode = {
                id: 'enqueue-1',
                type: VoiceFlowNodeType.Enqueue,
                data: {
                    next_step_id: 'old-id',
                } as EnqueueStep,
                position: { x: 0, y: 0 },
            }
            const formStep = mockEnqueueStep({
                next_step_id: 'old-id',
                conditional_routing: false,
                skip_step_id: null,
            })

            const updated = linkFormStep(
                relatedNode,
                formStep,
                'new-id',
            ) as EnqueueStep

            expect(updated?.next_step_id).toBe('new-id')
            expect(updated?.skip_step_id).toBeNull()
        })

        it('should update PlayMessage next_step_id', () => {
            const relatedNode: VoiceFlowNode = {
                id: 'play-1',
                type: VoiceFlowNodeType.PlayMessage,
                data: {
                    id: 'play-1',
                    step_type: VoiceFlowNodeType.PlayMessage,
                    name: 'Play message',
                    message: {
                        voice_message_type: 'text_to_speech',
                        text_to_speech_content: 'Hello',
                    },
                    next_step_id: 'old-id',
                },
                position: { x: 0, y: 0 },
            }

            const formStep = relatedNode.data

            const updated = linkFormStep(
                relatedNode,
                formStep,
                'new-id',
            ) as PlayMessageStep

            expect(updated?.next_step_id).toBe('new-id')
        })

        it('should return null for final nodes', () => {
            const relatedNode: VoiceFlowNode = {
                id: 'sms-1',
                type: VoiceFlowNodeType.SendToSMS,
                data: {
                    id: 'sms-1',
                    step_type: VoiceFlowNodeType.SendToSMS,
                    name: 'Send to SMS',
                    confirmation_message: {
                        voice_message_type: 'text_to_speech',
                        text_to_speech_content: '',
                    },
                    sms_content: '',
                    sms_integration_id: 1,
                    next_step_id: null,
                },
                position: { x: 0, y: 0 },
            }

            const formStep = relatedNode.data

            const updated = linkFormStep(relatedNode, formStep, 'new-id')

            expect(updated).toBeNull()
        })

        it('should return null if formStep is undefined', () => {
            const relatedNode: VoiceFlowNode = {
                id: 'node-1',
                type: VoiceFlowNodeType.PlayMessage,
                data: {
                    id: 'node-1',
                    step_type: VoiceFlowNodeType.PlayMessage,
                    name: 'Play message',
                    message: {
                        voice_message_type: 'text_to_speech',
                        text_to_speech_content: 'Hello',
                    },
                    next_step_id: 'old-id',
                },
                position: { x: 0, y: 0 },
            }

            const updated = linkFormStep(relatedNode, undefined, 'new-id')

            expect(updated).toBeNull()
        })

        it('should update IvrMenu branch option based on optionIndex', () => {
            const relatedNode: IvrOptionNode = {
                id: 'ivr-option-1',
                type: VoiceFlowNodeType.IvrOption,
                data: {
                    parentId: 'ivr-menu-1',
                    next_step_id: 'old-id',
                    optionIndex: 1,
                },
                position: { x: 0, y: 0 },
            }

            const formStep: IvrMenuStep = {
                id: 'ivr-menu-1',
                step_type: VoiceFlowNodeType.IvrMenu,
                name: 'IVR menu',
                message: {
                    voice_message_type: 'text_to_speech',
                    text_to_speech_content: 'Choose option',
                },
                branch_options: [
                    {
                        input_digit: '1',
                        branch_name: 'Option 1',
                        next_step_id: 'step-1',
                    },
                    {
                        input_digit: '2',
                        branch_name: 'Option 2',
                        next_step_id: 'old-id',
                    },
                    {
                        input_digit: '3',
                        branch_name: 'Option 3',
                        next_step_id: 'step-3',
                    },
                ],
            }

            const updated = linkFormStep(
                relatedNode,
                formStep,
                'new-id',
            ) as IvrMenuStep

            expect(updated?.branch_options[0].next_step_id).toBe('step-1')
            expect(updated?.branch_options[1].next_step_id).toBe('new-id')
            expect(updated?.branch_options[2].next_step_id).toBe('step-3')
        })

        it('should update Enqueue next_step_id', () => {
            const relatedNode: VoiceFlowNode = {
                id: 'enqueue-1',
                type: VoiceFlowNodeType.Enqueue,
                data: {
                    id: 'enqueue-1',
                    step_type: VoiceFlowNodeType.Enqueue,
                    name: 'Enqueue',
                    queue_id: 1,
                    next_step_id: 'old-id',
                } as EnqueueStep,
                position: { x: 0, y: 0 },
            }

            const formStep = relatedNode.data as EnqueueStep

            const updated = linkFormStep(
                relatedNode,
                formStep,
                'new-id',
            ) as EnqueueStep

            expect(updated?.next_step_id).toBe('new-id')
        })

        it('should return null for SendToVoicemail (final node)', () => {
            const relatedNode: VoiceFlowNode = {
                id: 'voicemail-1',
                type: VoiceFlowNodeType.SendToVoicemail,
                data: {
                    id: 'voicemail-1',
                    step_type: VoiceFlowNodeType.SendToVoicemail,
                    name: 'Send to voicemail',
                    voicemail: {
                        voice_message_type: 'text_to_speech',
                        text_to_speech_content: 'Leave a message',
                    },
                    allow_to_leave_voicemail: true,
                    next_step_id: null,
                },
                position: { x: 0, y: 0 },
            }

            const formStep = relatedNode.data

            const updated = linkFormStep(relatedNode, formStep, 'new-id')

            expect(updated).toBeNull()
        })

        it('should return null for unknown node type', () => {
            const relatedNode: VoiceFlowNode = {
                id: 'unknown-1',
                type: 'UnknownType' as any,
                data: {
                    id: 'unknown-1',
                    step_type: 'UnknownType' as any,
                    name: 'Unknown',
                },
                position: { x: 0, y: 0 },
            }

            const formStep = relatedNode.data as VoiceFlowNodeData

            const updated = linkFormStep(relatedNode, formStep, 'new-id')

            expect(updated).toBeNull()
        })

        it('should return null when TimeSplitConditional relatedNode is wrong type', () => {
            const relatedNode: VoiceFlowNode = {
                id: 'play-1',
                type: VoiceFlowNodeType.PlayMessage,
                data: {
                    id: 'play-1',
                    step_type: VoiceFlowNodeType.PlayMessage,
                    name: 'Play',
                    message: {
                        voice_message_type: 'text_to_speech',
                        text_to_speech_content: 'Hello',
                    },
                    next_step_id: 'next',
                },
                position: { x: 0, y: 0 },
            }

            const formStep: TimeSplitConditionalStep = {
                id: 'time-split',
                step_type: VoiceFlowNodeType.TimeSplitConditional,
                name: 'Time rule',
                on_true_step_id: 'true-id',
                on_false_step_id: 'false-id',
                rule_type: TimeSplitConditionalRuleType.BusinessHours,
            }

            const updated = linkFormStep(relatedNode, formStep, 'new-id')

            expect(updated).toBeNull()
        })

        it('should return null when IvrMenu relatedNode is wrong type', () => {
            const relatedNode: VoiceFlowNode = {
                id: 'play-1',
                type: VoiceFlowNodeType.PlayMessage,
                data: {
                    id: 'play-1',
                    step_type: VoiceFlowNodeType.PlayMessage,
                    name: 'Play',
                    message: {
                        voice_message_type: 'text_to_speech',
                        text_to_speech_content: 'Hello',
                    },
                    next_step_id: 'next',
                },
                position: { x: 0, y: 0 },
            }

            const formStep: IvrMenuStep = {
                id: 'ivr-menu',
                step_type: VoiceFlowNodeType.IvrMenu,
                name: 'IVR menu',
                message: {
                    voice_message_type: 'text_to_speech',
                    text_to_speech_content: 'Press 1',
                },
                branch_options: [
                    {
                        input_digit: '1',
                        branch_name: 'Option 1',
                        next_step_id: 'step-1',
                    },
                ],
            }

            const updated = linkFormStep(relatedNode, formStep, 'new-id')

            expect(updated).toBeNull()
        })
    })

    describe('pointsToEndNode', () => {
        const getNode = (id: string): VoiceFlowNode | undefined => {
            const nodes: Record<string, VoiceFlowNode> = {
                'end-node': {
                    id: 'end-node',
                    type: VoiceFlowNodeType.EndCall,
                    data: {},
                    position: { x: 0, y: 0 },
                },
                'intermediary-1': {
                    id: 'intermediary-1',
                    type: VoiceFlowNodeType.Intermediary,
                    data: { next_step_id: 'end-node' },
                    position: { x: 0, y: 0 },
                } as IntermediaryNode,
                'intermediary-2': {
                    id: 'intermediary-2',
                    type: VoiceFlowNodeType.Intermediary,
                    data: { next_step_id: 'intermediary-1' },
                    position: { x: 0, y: 0 },
                } as IntermediaryNode,
                'play-node': {
                    id: 'play-node',
                    type: VoiceFlowNodeType.PlayMessage,
                    data: {
                        id: 'play-node',
                        step_type: VoiceFlowNodeType.PlayMessage,
                        name: 'Play message',
                        message: {
                            voice_message_type: 'text_to_speech',
                            text_to_speech_content: 'Hello',
                        },
                        next_step_id: 'other-node',
                    },
                    position: { x: 0, y: 0 },
                },
            }
            return nodes[id]
        }

        it('should return true for EndCall node', () => {
            const node = getNode('end-node')
            const result_value = pointsToEndNode(node, getNode)
            expect(result_value).toBe(true)
        })

        it('should return true for intermediary pointing to EndCall', () => {
            const node = getNode('intermediary-1')
            const result_value = pointsToEndNode(node, getNode)
            expect(result_value).toBe(true)
        })

        it('should return true for chained intermediaries pointing to EndCall', () => {
            const node = getNode('intermediary-2')
            const result_value = pointsToEndNode(node, getNode)
            expect(result_value).toBe(true)
        })

        it('should return false for non-EndCall nodes', () => {
            const node = getNode('play-node')
            const result_value = pointsToEndNode(node, getNode)
            expect(result_value).toBe(false)
        })

        it('should return false for undefined node', () => {
            const result_value = pointsToEndNode(undefined, getNode)
            expect(result_value).toBe(false)
        })
    })

    describe('getFormTargetStepId', () => {
        const getNode = (id: string): VoiceFlowNode | undefined => {
            const nodes: Record<string, VoiceFlowNode> = {
                'play-node': {
                    id: 'play-node',
                    type: VoiceFlowNodeType.PlayMessage,
                    data: {
                        id: 'play-node',
                        step_type: VoiceFlowNodeType.PlayMessage,
                        name: 'Play message',
                        message: {
                            voice_message_type: 'text_to_speech',
                            text_to_speech_content: 'Hello',
                        },
                        next_step_id: 'next-node',
                    },
                    position: { x: 0, y: 0 },
                },
                'intermediary-1': {
                    id: 'intermediary-1',
                    type: VoiceFlowNodeType.Intermediary,
                    data: { next_step_id: 'play-node' },
                    position: { x: 0, y: 0 },
                } as IntermediaryNode,
                'intermediary-2': {
                    id: 'intermediary-2',
                    type: VoiceFlowNodeType.Intermediary,
                    data: { next_step_id: 'intermediary-1' },
                    position: { x: 0, y: 0 },
                } as IntermediaryNode,
                'end-node': {
                    id: 'end-node',
                    type: VoiceFlowNodeType.EndCall,
                    data: {},
                    position: { x: 0, y: 0 },
                },
                'time-split': {
                    id: 'time-split',
                    type: VoiceFlowNodeType.TimeSplitConditional,
                    data: {
                        id: 'time-split',
                        step_type: VoiceFlowNodeType.TimeSplitConditional,
                        name: 'Time rule',
                        on_true_step_id: 'node-1',
                        on_false_step_id: 'node-2',
                        rule_type: TimeSplitConditionalRuleType.BusinessHours,
                        custom_hours: null,
                    },
                    position: { x: 0, y: 0 },
                } as TimeSplitConditionalNode,
            }
            return nodes[id]
        }

        it('should return node id for regular nodes', () => {
            const node = getNode('play-node')!
            const targetId = getFormTargetStepId(node, getNode)
            expect(targetId).toBe('play-node')
        })

        it('should recursively resolve intermediary nodes', () => {
            const node = getNode('intermediary-1')!
            const targetId = getFormTargetStepId(node, getNode)
            expect(targetId).toBe('play-node')
        })

        it('should handle chained intermediary nodes', () => {
            const node = getNode('intermediary-2')!
            const targetId = getFormTargetStepId(node, getNode)
            expect(targetId).toBe('play-node')
        })

        it('should return null for EndCall node', () => {
            const node = getNode('end-node')!
            const targetId = getFormTargetStepId(node, getNode)
            expect(targetId).toBeNull()
        })
    })

    describe('updateTimeSplitNodeData', () => {
        it('should update on_true_step_id when it matches oldNextStepId', () => {
            const data: TimeSplitConditionalStep = {
                id: 'time-split',
                step_type: VoiceFlowNodeType.TimeSplitConditional,
                name: 'Time rule',
                on_true_step_id: 'old-id',
                on_false_step_id: 'other-id',
                rule_type: TimeSplitConditionalRuleType.BusinessHours,
            }

            const updated = updateTimeSplitNodeData(data, 'old-id', 'new-id')

            expect(updated.on_true_step_id).toBe('new-id')
            expect(updated.on_false_step_id).toBe('other-id')
        })

        it('should update on_false_step_id when it matches oldNextStepId', () => {
            const data: TimeSplitConditionalStep = {
                id: 'time-split',
                step_type: VoiceFlowNodeType.TimeSplitConditional,
                name: 'Time rule',
                on_true_step_id: 'other-id',
                on_false_step_id: 'old-id',
                rule_type: TimeSplitConditionalRuleType.BusinessHours,
            }

            const updated = updateTimeSplitNodeData(data, 'old-id', 'new-id')

            expect(updated.on_true_step_id).toBe('other-id')
            expect(updated.on_false_step_id).toBe('new-id')
        })

        it('should update both branches when both match oldNextStepId', () => {
            const data: TimeSplitConditionalStep = {
                id: 'time-split',
                step_type: VoiceFlowNodeType.TimeSplitConditional,
                name: 'Time rule',
                on_true_step_id: 'old-id',
                on_false_step_id: 'old-id',
                rule_type: TimeSplitConditionalRuleType.BusinessHours,
            }

            const updated = updateTimeSplitNodeData(data, 'old-id', 'new-id')

            expect(updated.on_true_step_id).toBe('new-id')
            expect(updated.on_false_step_id).toBe('new-id')
        })

        it('should not update branches when they do not match oldNextStepId', () => {
            const data: TimeSplitConditionalStep = {
                id: 'time-split',
                step_type: VoiceFlowNodeType.TimeSplitConditional,
                name: 'Time rule',
                on_true_step_id: 'different-id-1',
                on_false_step_id: 'different-id-2',
                rule_type: TimeSplitConditionalRuleType.BusinessHours,
            }

            const updated = updateTimeSplitNodeData(data, 'old-id', 'new-id')

            expect(updated.on_true_step_id).toBe('different-id-1')
            expect(updated.on_false_step_id).toBe('different-id-2')
        })
    })

    describe('updateIvrMenuNodeData', () => {
        it('should update multiple branch options when they match', () => {
            const data: IvrMenuStep = {
                id: 'ivr-menu',
                step_type: VoiceFlowNodeType.IvrMenu,
                name: 'IVR menu',
                message: {
                    voice_message_type: 'text_to_speech',
                    text_to_speech_content: 'Press 1 or 2',
                },
                branch_options: [
                    {
                        input_digit: '1',
                        branch_name: 'Option 1',
                        next_step_id: 'old-id',
                    },
                    {
                        input_digit: '2',
                        branch_name: 'Option 2',
                        next_step_id: 'old-id',
                    },
                    {
                        input_digit: '3',
                        branch_name: 'Option 3',
                        next_step_id: 'other-id',
                    },
                ],
            }

            const updated = updateIvrMenuNodeData(data, 'old-id', 'new-id')

            expect(updated.branch_options[0].next_step_id).toBe('new-id')
            expect(updated.branch_options[1].next_step_id).toBe('new-id')
            expect(updated.branch_options[2].next_step_id).toBe('other-id')
        })
    })

    describe('getNextSteps', () => {
        it('should return the correct next steps for all step types', () => {
            const steps: CallRoutingFlowSteps = {
                'step-1': mockPlayMessageStep({
                    id: 'step-1',
                    next_step_id: 'step-2',
                }),
                'step-2': mockIvrMenuStep({
                    id: 'step-2',
                    branch_options: [
                        { input_digit: '1', next_step_id: 'step-3' },
                        { input_digit: '2', next_step_id: 'step-4' },
                        { input_digit: '3', next_step_id: 'step-6' },
                    ],
                }),
                'step-3': mockTimeSplitConditionalStep({
                    id: 'step-3',
                    on_true_step_id: 'step-5',
                    on_false_step_id: 'step-6',
                }),
                'step-4': mockSendToVoicemailStep({
                    id: 'step-4',
                    next_step_id: null,
                }),
                'step-5': mockForwardToExternalNumberStep({
                    id: 'step-5',
                    next_step_id: 'step-6',
                }),
                'step-6': mockSendToSMSStep({
                    id: 'step-6',
                    next_step_id: null,
                }),
                'step-7': {
                    id: 'step-7',
                } as any,
                'step-8': mockEnqueueStep({
                    id: 'step-8',
                    next_step_id: 'step-9',
                    skip_step_id: 'step-10',
                    conditional_routing: true,
                }),
                'step-9': mockEnqueueStep({
                    id: 'step-8',
                    next_step_id: 'step-9',
                    skip_step_id: 'step-10',
                    conditional_routing: false,
                }),
            }

            expect(getNextSteps(steps, 'step-1')).toEqual(['step-2'])
            expect(getNextSteps(steps, 'step-2')).toEqual([
                'step-3',
                'step-4',
                'step-6',
            ])
            expect(getNextSteps(steps, 'step-3')).toEqual(['step-5', 'step-6'])
            expect(getNextSteps(steps, 'step-4')).toEqual([null])
            expect(getNextSteps(steps, 'step-5')).toEqual(['step-6'])
            expect(getNextSteps(steps, 'step-6')).toEqual([null])
            expect(getNextSteps(steps, 'step-7')).toEqual([])
            expect(getNextSteps(steps, 'step-8')).toEqual(['step-9', 'step-10'])
            expect(getNextSteps(steps, 'step-9')).toEqual(['step-9'])
        })

        it('should return skip step for Enqueue nodes even if conditional routing is false when includeInactive is true', () => {
            const steps: CallRoutingFlowSteps = {
                'step-1': mockEnqueueStep({
                    id: 'step-1',
                    next_step_id: 'step-2',
                    skip_step_id: 'step-3',
                    conditional_routing: false,
                }),
            }

            expect(getNextSteps(steps, 'step-1', true)).toEqual([
                'step-2',
                'step-3',
            ])
        })
    })

    describe('getParentSteps', () => {
        it('should return the correct parent steps for all step types', () => {
            const steps: CallRoutingFlowSteps = {
                'step-1': mockPlayMessageStep({
                    id: 'step-1',
                    next_step_id: 'step-2',
                }),
                'step-2': mockIvrMenuStep({
                    id: 'step-2',
                    branch_options: [
                        { input_digit: '1', next_step_id: 'step-3' },
                        { input_digit: '2', next_step_id: 'step-4' },
                        { input_digit: '3', next_step_id: 'step-6' },
                    ],
                }),
                'step-3': mockTimeSplitConditionalStep({
                    id: 'step-3',
                    on_true_step_id: 'step-5',
                    on_false_step_id: 'step-6',
                }),
                'step-4': mockSendToVoicemailStep({
                    id: 'step-4',
                    next_step_id: null,
                }),
                'step-5': mockForwardToExternalNumberStep({
                    id: 'step-5',
                    next_step_id: 'step-6',
                }),
                'step-6': mockSendToSMSStep({
                    id: 'step-6',
                    next_step_id: 'step-7',
                }),
                'step-7': mockEnqueueStep({
                    id: 'step-7',
                    next_step_id: null,
                }),
            }

            expect(getParentSteps(steps, 'step-1')).toEqual([])
            expect(getParentSteps(steps, 'step-2')).toEqual(['step-1'])
            expect(getParentSteps(steps, 'step-3')).toEqual(['step-2'])
            expect(getParentSteps(steps, 'step-4')).toEqual(['step-2'])
            expect(getParentSteps(steps, 'step-5')).toEqual(['step-3'])
            expect(getParentSteps(steps, 'step-6')).toEqual([
                'step-2',
                'step-3',
                'step-5',
            ])
            expect(getParentSteps(steps, 'step-7')).toEqual(['step-6'])
        })
    })

    describe('updateFormFlowOnNodeDelete', () => {
        it('should update the flow correctly when the only node is deleted', () => {
            const flow: CallRoutingFlow = {
                first_step_id: 'first-step',
                steps: {
                    'first-step': {
                        id: 'first-step',
                        name: 'Play message',
                        step_type: 'play_message',
                        message: {
                            voice_message_type: 'text_to_speech',
                            text_to_speech_content: '',
                        },
                        next_step_id: null,
                    },
                },
            }

            const updated = updateFormFlowOnNodeDelete(flow, 'first-step', [])

            expect(updated.first_step_id).toBe(null)
            expect(updated.steps).toEqual({})
        })

        it('should update the flow correctly when the second step is deleted', () => {
            const firstStep = mockPlayMessageStep({
                id: 'first-step',
                next_step_id: 'second-step',
            })
            const secondStep = mockPlayMessageStep({
                id: 'second-step',
                next_step_id: null,
            })
            const flow: CallRoutingFlow = {
                first_step_id: firstStep.id,
                steps: {
                    [firstStep.id]: firstStep,
                    [secondStep.id]: secondStep,
                },
            }

            const updated = updateFormFlowOnNodeDelete(flow, secondStep.id, [])

            expect(updated.first_step_id).toBe(firstStep.id)
            expect(updated.steps).toEqual({
                [firstStep.id]: {
                    ...firstStep,
                    next_step_id: null,
                },
            })
        })

        it('should update the flow correctly when a branching node is deleted', () => {
            const firstStep = mockPlayMessageStep({
                id: 'first-step',
                next_step_id: 'second-step',
            })
            const secondStep = mockIvrMenuStep({
                id: 'second-step',
                branch_options: [
                    {
                        input_digit: '1',
                        next_step_id: 'branch-option-1',
                    },
                    {
                        input_digit: '2',
                        next_step_id: 'branch-option-2',
                    },
                ],
            })
            const branchOption1 = mockSendToSMSStep({
                id: 'branch-option-1',
                next_step_id: null,
            })
            const branchOption2 = mockSendToVoicemailStep({
                id: 'branch-option-2',
                next_step_id: null,
            })
            const flow: CallRoutingFlow = {
                first_step_id: firstStep.id,
                steps: {
                    [firstStep.id]: firstStep,
                    [secondStep.id]: secondStep,
                    [branchOption1.id]: branchOption1,
                    [branchOption2.id]: branchOption2,
                },
            }

            const updated = updateFormFlowOnNodeDelete(
                flow,
                secondStep.id,
                [branchOption1.id, branchOption2.id],
                null,
            )

            expect(updated.first_step_id).toBe(firstStep.id)
            expect(updated.steps).toEqual({
                [firstStep.id]: {
                    ...firstStep,
                    next_step_id: null,
                },
            })
        })

        it('should update the flow correctly when the parent node is an ivr node and current node is on branch option', () => {
            const firstStep = mockPlayMessageStep({
                id: 'first-step',
                next_step_id: 'second-step',
            })
            const secondStep = mockIvrMenuStep({
                id: 'second-step',
                branch_options: [
                    { input_digit: '1', next_step_id: 'branch-option-1' },
                    { input_digit: '2', next_step_id: 'branch-option-2' },
                ],
            })
            const branchOption1 = mockPlayMessageStep({
                id: 'branch-option-1',
                next_step_id: 'branch-option-1-extra',
            })
            const branchOption1Extra = mockSendToSMSStep({
                id: 'branch-option-1-extra',
                next_step_id: null,
            })
            const branchOption2 = mockSendToVoicemailStep({
                id: 'branch-option-2',
                next_step_id: null,
            })
            const flow: CallRoutingFlow = {
                first_step_id: firstStep.id,
                steps: {
                    [firstStep.id]: firstStep,
                    [secondStep.id]: secondStep,
                    [branchOption1.id]: branchOption1,
                    [branchOption1Extra.id]: branchOption1Extra,
                    [branchOption2.id]: branchOption2,
                },
            }

            const updated = updateFormFlowOnNodeDelete(
                flow,
                branchOption1.id,
                [],
            )

            expect(updated.first_step_id).toBe(firstStep.id)
            expect(updated.steps).toEqual({
                [firstStep.id]: firstStep,
                [secondStep.id]: {
                    ...secondStep,
                    branch_options: [
                        {
                            ...secondStep.branch_options[0],
                            next_step_id: branchOption1Extra.id,
                        },
                        secondStep.branch_options[1],
                    ],
                },
                [branchOption1Extra.id]: branchOption1Extra,
                [branchOption2.id]: branchOption2,
            })
        })

        it('should update the flow correctly when the parent node is an ivr node and current node is the convergence point of branches', () => {
            const firstStep = mockPlayMessageStep({
                id: 'first-step',
                next_step_id: 'second-step',
            })
            const secondStep = mockIvrMenuStep({
                id: 'second-step',
                branch_options: [
                    { input_digit: '1', next_step_id: 'conv-node' },
                    { input_digit: '2', next_step_id: 'conv-node' },
                ],
            })
            const convNode = mockSendToSMSStep({
                id: 'conv-node',
                next_step_id: null,
            })
            const flow: CallRoutingFlow = {
                first_step_id: firstStep.id,
                steps: {
                    [firstStep.id]: firstStep,
                    [secondStep.id]: secondStep,
                    [convNode.id]: convNode,
                },
            }
            const updated = updateFormFlowOnNodeDelete(flow, convNode.id, [])
            expect(updated.first_step_id).toBe(firstStep.id)
            expect(updated.steps).toEqual({
                [firstStep.id]: firstStep,
                [secondStep.id]: {
                    ...secondStep,
                    branch_options: [
                        { ...secondStep.branch_options[0], next_step_id: null },
                        { ...secondStep.branch_options[1], next_step_id: null },
                    ],
                },
            })
        })

        it('should update the flow correctly when the parent node is a time split node - first branch', () => {
            const firstStep = mockPlayMessageStep({
                id: 'first-step',
                next_step_id: 'second-step',
            })
            const secondStep = mockTimeSplitConditionalStep({
                id: 'second-step',
                on_true_step_id: 'branch-option-1',
                on_false_step_id: 'branch-option-2',
            })
            const branchOption1 = mockSendToSMSStep({
                id: 'branch-option-1',
                next_step_id: null,
            })
            const branchOption2 = mockSendToVoicemailStep({
                id: 'branch-option-2',
                next_step_id: null,
            })
            const flow: CallRoutingFlow = {
                first_step_id: firstStep.id,
                steps: {
                    [firstStep.id]: firstStep,
                    [secondStep.id]: secondStep,
                    [branchOption1.id]: branchOption1,
                    [branchOption2.id]: branchOption2,
                },
            }

            const updated = updateFormFlowOnNodeDelete(
                flow,
                branchOption1.id,
                [],
            )

            expect(updated.first_step_id).toBe(firstStep.id)
            expect(updated.steps).toEqual({
                [firstStep.id]: firstStep,
                [secondStep.id]: {
                    ...secondStep,
                    on_true_step_id: null,
                    on_false_step_id: branchOption2.id,
                },
                [branchOption2.id]: branchOption2,
            })
        })

        it('should update the flow correctly when the parent node is a time split node - second branch', () => {
            const firstStep = mockPlayMessageStep({
                id: 'first-step',
                next_step_id: 'second-step',
            })
            const secondStep = mockTimeSplitConditionalStep({
                id: 'second-step',
                on_true_step_id: 'branch-option-1',
                on_false_step_id: 'branch-option-2',
            })
            const branchOption1 = mockSendToSMSStep({
                id: 'branch-option-1',
                next_step_id: null,
            })
            const branchOption2 = mockSendToVoicemailStep({
                id: 'branch-option-2',
                next_step_id: null,
            })
            const flow: CallRoutingFlow = {
                first_step_id: firstStep.id,
                steps: {
                    [firstStep.id]: firstStep,
                    [secondStep.id]: secondStep,
                    [branchOption1.id]: branchOption1,
                    [branchOption2.id]: branchOption2,
                },
            }

            const updated = updateFormFlowOnNodeDelete(
                flow,
                branchOption2.id,
                [],
            )

            expect(updated.first_step_id).toBe(firstStep.id)
            expect(updated.steps).toEqual({
                [firstStep.id]: firstStep,
                [secondStep.id]: {
                    ...secondStep,
                    on_true_step_id: branchOption1.id,
                    on_false_step_id: null,
                },
                [branchOption1.id]: branchOption1,
            })
        })

        it('should update the flow correctly when the parent node is an enqueue node', () => {
            const firstStep = mockPlayMessageStep({
                id: 'first-step',
                next_step_id: 'second-step',
            })
            const secondStep = mockEnqueueStep({
                id: 'second-step',
                conditional_routing: true,
                next_step_id: 'third-step',
                skip_step_id: 'third-step',
            })
            const thirdStep = mockPlayMessageStep({
                id: 'third-step',
                next_step_id: 'fourth-step',
            })
            const fourthStep = mockSendToSMSStep({
                id: 'fourth-step',
                next_step_id: null,
            })
            const flow: CallRoutingFlow = {
                first_step_id: firstStep.id,
                steps: {
                    [firstStep.id]: firstStep,
                    [secondStep.id]: secondStep,
                    [thirdStep.id]: thirdStep,
                    [fourthStep.id]: fourthStep,
                },
            }

            const updated = updateFormFlowOnNodeDelete(flow, thirdStep.id, [])

            expect(updated.first_step_id).toBe(firstStep.id)
            expect(updated.steps).toEqual({
                [firstStep.id]: firstStep,
                [secondStep.id]: {
                    ...secondStep,
                    next_step_id: fourthStep.id,
                    skip_step_id: fourthStep.id,
                },
                [fourthStep.id]: fourthStep,
            })
        })
    })

    describe('addIvrOption', () => {
        let mockSetNodes: jest.Mock
        let mockNodes: VoiceFlowNode[]

        beforeEach(() => {
            mockSetNodes = jest.fn()
            mockNodes = []
            jest.clearAllMocks()

            // Mock uuid.v4 only for these tests
            ;(uuid.v4 as jest.Mock).mockReturnValue('new-option-id')
        })

        afterEach(() => {
            // Clear the mock
            ;(uuid.v4 as jest.Mock).mockClear()
        })

        const createMockIvrOptionNode = (
            id: string,
            parentId: string,
            optionIndex: number,
            nextStepId: string,
        ): IvrOptionNode => ({
            id,
            type: VoiceFlowNodeType.IvrOption,
            data: {
                parentId,
                optionIndex,
                next_step_id: nextStepId,
            },
            position: { x: 100, y: 100 },
        })

        it('should add a new IVR option node at the correct index', () => {
            const parentNodeId = 'parent-1'
            const intermediaryNodeId = 'intermediary-1'
            const insertAtIndex = 1

            mockNodes = [
                createMockIvrOptionNode(
                    'option-1',
                    parentNodeId,
                    0,
                    intermediaryNodeId,
                ),
                createMockIvrOptionNode(
                    'option-2',
                    parentNodeId,
                    1,
                    intermediaryNodeId,
                ),
                createMockIvrOptionNode(
                    'option-3',
                    parentNodeId,
                    2,
                    intermediaryNodeId,
                ),
            ]

            mockSetNodes.mockImplementation((callback) => {
                return callback(mockNodes)
            })

            addIvrOption(
                parentNodeId,
                intermediaryNodeId,
                insertAtIndex,
                mockSetNodes,
            )

            expect(mockSetNodes).toHaveBeenCalledWith(expect.any(Function))

            const callback = mockSetNodes.mock.calls[0][0]
            const result = callback(mockNodes)

            // Check that existing nodes with index >= insertAtIndex have their indices incremented
            const updatedOption2 = result.find(
                (n: VoiceFlowNode) => n.id === 'option-2',
            )
            const updatedOption3 = result.find(
                (n: VoiceFlowNode) => n.id === 'option-3',
            )

            expect(updatedOption2.data.optionIndex).toBe(2) // Was 1, now 2
            expect(updatedOption3.data.optionIndex).toBe(3) // Was 2, now 3

            // Check that the new node was inserted with generated ID
            const newNodeInResult = result.find(
                (n: VoiceFlowNode) => n.id === 'new-option-id',
            )
            expect(newNodeInResult).toBeDefined()
            expect(newNodeInResult.data.optionIndex).toBe(insertAtIndex)
            expect(newNodeInResult.data.parentId).toBe(parentNodeId)
            expect(newNodeInResult.data.next_step_id).toBe(intermediaryNodeId)
        })

        it('should only affect IVR option nodes with matching parentId', () => {
            const parentNodeId = 'parent-1'
            const otherParentId = 'parent-2'
            const intermediaryNodeId = 'intermediary-1'
            const insertAtIndex = 1

            mockNodes = [
                createMockIvrOptionNode(
                    'option-1',
                    parentNodeId,
                    0,
                    intermediaryNodeId,
                ),
                createMockIvrOptionNode(
                    'option-2',
                    parentNodeId,
                    1,
                    intermediaryNodeId,
                ),
                createMockIvrOptionNode(
                    'other-option',
                    otherParentId,
                    1,
                    intermediaryNodeId,
                ), // Different parent
                {
                    id: 'non-ivr-node',
                    type: VoiceFlowNodeType.PlayMessage,
                    data: {},
                    position: { x: 0, y: 0 },
                } as VoiceFlowNode,
            ]

            mockSetNodes.mockImplementation((callback) => {
                return callback(mockNodes)
            })

            addIvrOption(
                parentNodeId,
                intermediaryNodeId,
                insertAtIndex,
                mockSetNodes,
            )

            const callback = mockSetNodes.mock.calls[0][0]
            const result = callback(mockNodes)

            // Node with different parent should not be affected
            const otherOption = result.find(
                (n: VoiceFlowNode) => n.id === 'other-option',
            )
            expect(otherOption.data.optionIndex).toBe(1) // Should remain unchanged

            // Non-IVR node should not be affected
            const nonIvrNode = result.find(
                (n: VoiceFlowNode) => n.id === 'non-ivr-node',
            )
            expect(nonIvrNode).toBeDefined()
            expect(nonIvrNode.type).toBe(VoiceFlowNodeType.PlayMessage)
        })

        it('should handle inserting at index 0 correctly', () => {
            const parentNodeId = 'parent-1'
            const intermediaryNodeId = 'intermediary-1'
            const insertAtIndex = 0

            mockNodes = [
                createMockIvrOptionNode(
                    'option-0',
                    parentNodeId,
                    0,
                    intermediaryNodeId,
                ),
                createMockIvrOptionNode(
                    'option-1',
                    parentNodeId,
                    1,
                    intermediaryNodeId,
                ),
            ]

            mockSetNodes.mockImplementation((callback) => {
                return callback(mockNodes)
            })

            addIvrOption(
                parentNodeId,
                intermediaryNodeId,
                insertAtIndex,
                mockSetNodes,
            )

            const callback = mockSetNodes.mock.calls[0][0]
            const result = callback(mockNodes)

            // All existing options should have their indices incremented
            const updatedOption0 = result.find(
                (n: VoiceFlowNode) => n.id === 'option-0',
            )
            const updatedOption1 = result.find(
                (n: VoiceFlowNode) => n.id === 'option-1',
            )

            expect(updatedOption0.data.optionIndex).toBe(1)
            expect(updatedOption1.data.optionIndex).toBe(2)

            // New node should be inserted at the beginning
            const newNode = result.find(
                (n: VoiceFlowNode) => n.id === 'new-option-id',
            )
            expect(newNode.data.optionIndex).toBe(0)
            expect(result.indexOf(newNode)).toBe(0)
        })

        it('should handle inserting at the end when no existing nodes match the index', () => {
            const parentNodeId = 'parent-1'
            const intermediaryNodeId = 'intermediary-1'
            const insertAtIndex = 5 // Higher than any existing index

            mockNodes = [
                createMockIvrOptionNode(
                    'option-0',
                    parentNodeId,
                    0,
                    intermediaryNodeId,
                ),
                createMockIvrOptionNode(
                    'option-1',
                    parentNodeId,
                    1,
                    intermediaryNodeId,
                ),
                {
                    id: 'other-node',
                    type: VoiceFlowNodeType.PlayMessage,
                    data: {},
                    position: { x: 0, y: 0 },
                } as VoiceFlowNode,
            ]

            mockSetNodes.mockImplementation((callback) => {
                return callback(mockNodes)
            })

            addIvrOption(
                parentNodeId,
                intermediaryNodeId,
                insertAtIndex,
                mockSetNodes,
            )

            const callback = mockSetNodes.mock.calls[0][0]
            const result = callback(mockNodes)

            // No existing nodes should have their indices changed
            const option0 = result.find(
                (n: VoiceFlowNode) => n.id === 'option-0',
            )
            const option1 = result.find(
                (n: VoiceFlowNode) => n.id === 'option-1',
            )

            expect(option0.data.optionIndex).toBe(0)
            expect(option1.data.optionIndex).toBe(1)

            // New node should be added at the end
            const newNode = result.find(
                (n: VoiceFlowNode) => n.id === 'new-option-id',
            )
            expect(newNode).toBeDefined()
            expect(result[result.length - 1]).toBe(newNode)
        })

        it('should handle empty nodes array', () => {
            const parentNodeId = 'parent-1'
            const intermediaryNodeId = 'intermediary-1'
            const insertAtIndex = 0

            mockNodes = []

            mockSetNodes.mockImplementation((callback) => {
                return callback(mockNodes)
            })

            addIvrOption(
                parentNodeId,
                intermediaryNodeId,
                insertAtIndex,
                mockSetNodes,
            )

            expect(mockSetNodes).toHaveBeenCalledWith(expect.any(Function))

            const callback = mockSetNodes.mock.calls[0][0]
            const result = callback(mockNodes)

            expect(result).toHaveLength(1)
            expect(result[0].id).toBe('new-option-id')
            expect(result[0].data.optionIndex).toBe(insertAtIndex)
            expect(result[0].data.parentId).toBe(parentNodeId)
            expect(result[0].data.next_step_id).toBe(intermediaryNodeId)
        })
    })
})
