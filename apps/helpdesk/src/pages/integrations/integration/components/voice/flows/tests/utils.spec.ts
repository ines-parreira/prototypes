import { Edge } from '@xyflow/react'

import {
    mockIvrMenuStep,
    mockPlayMessageStep,
    mockSendToSMSStep,
    mockSendToVoicemailStep,
    mockTimeSplitConditionalStep,
} from '@gorgias/helpdesk-mocks'
import {
    CallRoutingFlow,
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
    canAddNewStepOnEdge,
    createIvrOptionNode,
    createTimeSplitOptionNode,
    findConvergencePointsInVoiceFlow,
    generateNodeData,
    getEdgeProps,
    getFormTargetStepId,
    getNextNodes,
    getSourceNodes,
    isBranchingNode,
    isBranchingOption,
    isVoiceFlowStep,
    linkFormStep,
    pointsToEndNode,
    transformToReactFlowNodes,
    updateIvrMenuNodeData,
    updateTimeSplitNodeData,
} from '../utils'

describe('utils', () => {
    describe('canAddNewStepOnEdge', () => {
        it('should return false if the edge is an IVRMenu', () => {
            const sourceNode: IvrMenuNode = {
                type: VoiceFlowNodeType.IvrMenu,
                id: '1',
                position: { x: 0, y: 0 },
                data: mockIvrMenuStep(),
            }

            expect(canAddNewStepOnEdge(sourceNode)).toBe(false)
        })

        it('should return false if the edge is a voicemail', () => {
            const edge = {
                type: VoiceFlowNodeType.SendToVoicemail,
                id: '1',
                position: { x: 0, y: 0 },
            } as SendToVoicemailNode

            expect(canAddNewStepOnEdge(edge)).toBe(false)
        })

        it('should return false if the edge is a forward to', () => {
            const edge = {
                type: VoiceFlowNodeType.ForwardToExternalNumber,
                id: '1',
                position: { x: 0, y: 0 },
            } as ForwardToExternalNode

            expect(canAddNewStepOnEdge(edge)).toBe(false)
        })

        it('should return true if the edge is not an IVRMenu', () => {
            const sourceNode: EndCallNode = {
                type: VoiceFlowNodeType.EndCall,
                id: '1',
                position: { x: 0, y: 0 },
                data: {},
            }

            expect(canAddNewStepOnEdge(sourceNode)).toBe(true)
        })
    })

    describe('isVoiceFlowStep', () => {
        it('should return false if the step is not a valid VoiceFlowNodeType', () => {
            expect(isVoiceFlowStep('invalid')).toBe(false)
        })
    })

    describe('getNextNodes', () => {
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
            // const intermediaryNode1 = intermediaryNodes[0] as IntermediaryNode
            // const intermediaryNode2 = intermediaryNodes[1] as IntermediaryNode
            //
            // // check options from ivr menu point to intermediary node 2
            // ;['play_message_3', 'voicemail'].forEach((id) => {
            //     const convergingNode = nodes.find((node) => node.id === id)
            //     expect(convergingNode).toBeDefined()
            //     expect((convergingNode as any).data.next_step_id).toBe(
            //         intermediaryNode2.id,
            //     )
            // })
            // // check play message 2 and intermediary node 2 to intermediary node 1
            // ;['play_message_2', intermediaryNode2.id].forEach((id) => {
            //     const convergingNode = nodes.find((node) => node.id === id)
            //     expect(convergingNode).toBeDefined()
            //     expect((convergingNode as any).data.next_step_id).toBe(
            //         intermediaryNode1.id,
            //     )
            // })
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
        it('should return short edge props for IvrMenu source', () => {
            const edge: Edge = {
                id: 'edge1',
                source: 'ivr-node',
                target: 'target-node',
            }
            const nodes: VoiceFlowNode[] = [
                {
                    id: 'ivr-node',
                    type: VoiceFlowNodeType.IvrMenu,
                    data: mockIvrMenuStep(),
                    position: { x: 0, y: 0 },
                } as IvrMenuNode,
            ]

            const result = getEdgeProps(edge, nodes)

            expect(result).toEqual({ weight: 50, height: 12 })
        })

        it('should return short edge props for TimeSplitConditional source', () => {
            const edge: Edge = {
                id: 'edge1',
                source: 'time-split-node',
                target: 'target-node',
            }
            const nodes: VoiceFlowNode[] = [
                {
                    id: 'time-split-node',
                    type: VoiceFlowNodeType.TimeSplitConditional,
                    data: mockTimeSplitConditionalStep(),
                    position: { x: 0, y: 0 },
                } as TimeSplitConditionalNode,
            ]

            const result = getEdgeProps(edge, nodes)

            expect(result).toEqual({ weight: 50, height: 12 })
        })

        it('should return short edge props for IvrOption source', () => {
            const edge: Edge = {
                id: 'edge1',
                source: 'ivr-option-node',
                target: 'target-node',
            }
            const nodes: VoiceFlowNode[] = [
                {
                    id: 'ivr-option-node',
                    type: VoiceFlowNodeType.IvrOption,
                    position: { x: 0, y: 0 },
                } as IvrOptionNode,
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
        it('should return true for IvrMenu node', () => {
            const node: IvrMenuNode = {
                type: VoiceFlowNodeType.IvrMenu,
                id: '1',
                position: { x: 0, y: 0 },
                data: mockIvrMenuStep(),
            }

            expect(isBranchingNode(node)).toBe(true)
        })

        it('should return true for TimeSplitConditional node', () => {
            const node: TimeSplitConditionalNode = {
                type: VoiceFlowNodeType.TimeSplitConditional,
                id: '1',
                position: { x: 0, y: 0 },
                data: mockTimeSplitConditionalStep(),
            }

            expect(isBranchingNode(node)).toBe(true)
        })

        it('should return false for PlayMessage node', () => {
            const node: PlayMessageNode = {
                type: VoiceFlowNodeType.PlayMessage,
                id: '1',
                position: { x: 0, y: 0 },
                data: mockPlayMessageStep(),
            }

            expect(isBranchingNode(node)).toBe(false)
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
                },
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
})
