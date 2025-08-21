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
    IvrMenuNode,
    IvrOptionNode,
    SendToVoicemailNode,
    TimeSplitConditionalNode,
} from '../types'
import {
    canAddNewStepOnEdge,
    createIvrOptionNode,
    createTimeSplitOptionNode,
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
                        next_step_id: END_CALL_NODE.id,
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
                        next_step_id: END_CALL_NODE.id,
                    },
                },
                {
                    id: 'voicemail',
                    type: VoiceFlowNodeType.SendToVoicemail,
                    data: {
                        ...voicemailNode,
                        next_step_id: END_CALL_NODE.id,
                    },
                },
                {
                    ...END_CALL_NODE,
                },
            ]

            expect(nodes).toEqual(
                expectedNodes.map((node) => ({
                    ...node,
                    position: { x: 0, y: 0 },
                })),
            )
        })
    })
})
