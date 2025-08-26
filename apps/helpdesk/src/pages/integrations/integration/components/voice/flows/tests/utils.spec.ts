import {
    mockIvrMenuStep,
    mockPlayMessageStep,
    mockSendToVoicemailStep,
    mockTimeSplitConditionalStep,
} from '@gorgias/helpdesk-mocks'
import { CallRoutingFlow } from '@gorgias/helpdesk-types'

import {
    END_CALL_NODE,
    INCOMING_CALL_NODE,
    VoiceFlowNodeType,
} from '../constants'
import {
    EndCallNode,
    IntermediaryNode,
    IvrMenuNode,
    IvrOptionNode,
    SendToVoicemailNode,
    TimeSplitConditionalNode,
    VoiceFlowNode,
} from '../types'
import {
    canAddNewStepOnEdge,
    createIvrOptionNode,
    createTimeSplitOptionNode,
    findConvergencePointsInVoiceFlow,
    getNextNodes,
    isVoiceFlowStep,
    transformToReactFlowNodes,
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
                ivrMenuNode,
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
            )

            expect(node).toEqual({
                id: expect.any(String),
                type: VoiceFlowNodeType.TimeSplitOption,
                data: {
                    parentId: timeSplitConditionalNode.id,
                    next_step_id: timeSplitConditionalNode.data.on_true_step_id,
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
                },
                {
                    id: expect.any(String),
                    type: VoiceFlowNodeType.TimeSplitOption,
                    data: {
                        parentId: 'time_split_conditional',
                        next_step_id: 'play_message_3',
                    },
                },
                {
                    id: expect.any(String),
                    type: VoiceFlowNodeType.TimeSplitOption,
                    data: {
                        parentId: 'time_split_conditional',
                        next_step_id: 'voicemail',
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
})
