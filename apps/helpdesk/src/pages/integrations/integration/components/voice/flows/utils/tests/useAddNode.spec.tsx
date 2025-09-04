import { ReactNode } from 'react'

import { assumeMock } from '@repo/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'

import { mockPlayMessageStep } from '@gorgias/helpdesk-mocks'

import { FlowProvider } from 'core/ui/flows'
import { getIntermediaryNodeId } from 'core/ui/flows/utils'

import { VoiceFlowNodeType } from '../../constants'
import {
    IntermediaryNode,
    VoiceFlowFormValues,
    VoiceFlowNode,
} from '../../types'
import { useAddNode } from '../useAddNode'

jest.mock('uuid')
const mockUuid = assumeMock(uuidv4).mockReturnValue('new-node-id')

const mockSetNodes = jest.fn()
const mockGetNode = jest.fn()
const mockGetNodes = jest.fn()

jest.mock('../../useVoiceFlow', () => ({
    useVoiceFlow: () => ({
        setNodes: mockSetNodes,
        getNode: mockGetNode,
        getNodes: mockGetNodes,
    }),
}))

describe('useAddNode', () => {
    const mockStep = mockPlayMessageStep({
        id: 'source-node',
        next_step_id: 'end_call',
    })

    const mockIncomingNode: VoiceFlowNode = {
        id: 'incoming_call',
        type: VoiceFlowNodeType.IncomingCall,
        data: {
            next_step_id: 'source-node',
        },
        position: { x: 0, y: 0 },
    }

    const mockSourceNode: VoiceFlowNode = {
        id: 'source-node',
        type: VoiceFlowNodeType.PlayMessage,
        data: mockStep,
        position: { x: 0, y: 0 },
    }

    const mockEndNode: VoiceFlowNode = {
        id: 'end_call',
        type: VoiceFlowNodeType.EndCall,
        data: {},
        position: { x: 0, y: 0 },
    }

    const defaultFormValues: VoiceFlowFormValues = {
        first_step_id: mockStep.id,
        steps: {
            [mockStep.id]: mockStep,
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockGetNodes.mockReturnValue([
            mockIncomingNode,
            mockSourceNode,
            mockEndNode,
        ])
        mockGetNode.mockImplementation((id: string) => {
            const nodes: Record<string, VoiceFlowNode> = {
                incoming_call: mockIncomingNode,
                'source-node': mockSourceNode,
                end_call: mockEndNode,
            }
            return nodes[id]
        })
    })

    const Wrapper = ({ children }: { children: ReactNode }) => {
        const methods = useForm<VoiceFlowFormValues>({
            defaultValues: defaultFormValues,
        })

        return (
            <FlowProvider
                defaultNodes={[mockIncomingNode, mockSourceNode, mockEndNode]}
            >
                <FormProvider {...methods}>{children}</FormProvider>
            </FlowProvider>
        )
    }

    describe('canAddFinalNode', () => {
        it('should return true when target points to EndCall', () => {
            const { result } = renderHook(
                () => useAddNode('source-node', 'end_call'),
                { wrapper: Wrapper },
            )

            expect(result.current.canAddFinalNode).toBe(true)
        })

        it('should return false when target does not point to EndCall', () => {
            mockGetNode.mockImplementation((id: string) => {
                if (id === 'other-node') {
                    return {
                        id: 'other-node',
                        type: VoiceFlowNodeType.PlayMessage,
                        data: mockPlayMessageStep({ id: 'other-node' }),
                        position: { x: 0, y: 0 },
                    }
                }
                return mockSourceNode
            })

            const { result } = renderHook(
                () => useAddNode('source-node', 'other-node'),
                { wrapper: Wrapper },
            )

            expect(result.current.canAddFinalNode).toBe(false)
        })
    })

    describe('addNode', () => {
        it('should add a PlayMessage node between source and target', async () => {
            const { result } = renderHook(
                () => useAddNode('source-node', 'end_call'),
                { wrapper: Wrapper },
            )

            act(() => {
                result.current.addNode(VoiceFlowNodeType.PlayMessage)
            })

            await waitFor(() =>
                expect(mockSetNodes).toHaveBeenCalledWith(
                    expect.arrayContaining([
                        expect.objectContaining({
                            id: 'new-node-id',
                            type: VoiceFlowNodeType.PlayMessage,
                            data: expect.objectContaining({
                                id: 'new-node-id',
                                name: 'Play message',
                                step_type: VoiceFlowNodeType.PlayMessage,
                                next_step_id: 'end_call',
                            }),
                        }),
                    ]),
                ),
            )
        })

        it('should add a TimeSplitConditional node', () => {
            mockUuid.mockReturnValueOnce('new-node-id')

            const { result } = renderHook(
                () => useAddNode('source-node', 'end_call'),
                { wrapper: Wrapper },
            )

            act(() => {
                result.current.addNode(VoiceFlowNodeType.TimeSplitConditional)
            })

            expect(mockSetNodes).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: 'new-node-id',
                        type: VoiceFlowNodeType.TimeSplitConditional,
                        data: expect.objectContaining({
                            id: 'new-node-id',
                            name: 'Time rule',
                            step_type: VoiceFlowNodeType.TimeSplitConditional,
                            on_true_step_id: 'new-node-id-true',
                            on_false_step_id: 'new-node-id-false',
                        }),
                    }),
                    expect.objectContaining({
                        id: 'new-node-id-true',
                        type: VoiceFlowNodeType.TimeSplitOption,
                        data: expect.objectContaining({
                            parentId: 'new-node-id',
                            next_step_id: getIntermediaryNodeId('new-node-id'),
                        }),
                    }),
                    expect.objectContaining({
                        id: 'new-node-id-false',
                        type: VoiceFlowNodeType.TimeSplitOption,
                        data: expect.objectContaining({
                            parentId: 'new-node-id',
                            next_step_id: getIntermediaryNodeId('new-node-id'),
                        }),
                    }),
                ]),
            )
        })

        it('should add a SendToVoicemail node', async () => {
            const { result } = renderHook(
                () => useAddNode('source-node', 'end_call'),
                { wrapper: Wrapper },
            )

            act(() => {
                result.current.addNode(VoiceFlowNodeType.SendToVoicemail)
            })

            await waitFor(() =>
                expect(mockSetNodes).toHaveBeenCalledWith(
                    expect.arrayContaining([
                        expect.objectContaining({
                            id: 'new-node-id',
                            type: VoiceFlowNodeType.SendToVoicemail,
                            data: expect.objectContaining({
                                id: 'new-node-id',
                                name: 'Send to voicemail',
                                step_type: VoiceFlowNodeType.SendToVoicemail,
                                allow_to_leave_voicemail: true,
                                next_step_id: 'end_call',
                            }),
                        }),
                    ]),
                ),
            )
        })

        it('should add a SendToSMS node', () => {
            const { result } = renderHook(
                () => useAddNode('source-node', 'end_call'),
                { wrapper: Wrapper },
            )

            act(() => {
                result.current.addNode(VoiceFlowNodeType.SendToSMS)
            })

            expect(mockSetNodes).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: 'new-node-id',
                        type: VoiceFlowNodeType.SendToSMS,
                        data: expect.objectContaining({
                            id: 'new-node-id',
                            name: 'Send to SMS',
                            step_type: VoiceFlowNodeType.SendToSMS,
                            next_step_id: 'end_call',
                        }),
                    }),
                ]),
            )
        })

        it('should add an Enqueue node', () => {
            const { result } = renderHook(
                () => useAddNode('source-node', 'end_call'),
                { wrapper: Wrapper },
            )

            act(() => {
                result.current.addNode(VoiceFlowNodeType.Enqueue)
            })

            expect(mockSetNodes).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: 'new-node-id',
                        type: VoiceFlowNodeType.Enqueue,
                        data: expect.objectContaining({
                            id: 'new-node-id',
                            name: 'Route to',
                            step_type: VoiceFlowNodeType.Enqueue,
                            next_step_id: 'end_call',
                        }),
                    }),
                ]),
            )
        })

        it('should not add node if source or target is undefined', () => {
            mockGetNode.mockImplementation(() => undefined)

            const { result } = renderHook(
                () => useAddNode('invalid-source', 'invalid-target'),
                { wrapper: Wrapper },
            )

            act(() => {
                result.current.addNode(VoiceFlowNodeType.PlayMessage)
            })

            expect(mockSetNodes).not.toHaveBeenCalled()
        })
    })

    describe('addNewStepInForm', () => {
        const mockSetValue = jest.fn()
        const Wrapper = ({ children }: { children: ReactNode }) => {
            const methods = useForm<VoiceFlowFormValues>({
                defaultValues: defaultFormValues,
            })
            methods.setValue = mockSetValue

            return (
                <FlowProvider
                    defaultNodes={[
                        mockIncomingNode,
                        mockSourceNode,
                        mockEndNode,
                    ]}
                >
                    <FormProvider {...methods}>{children}</FormProvider>
                </FlowProvider>
            )
        }

        it('should add new step as first step when source is IncomingCall', () => {
            const mockSetValue = jest.fn()

            const FormWrapper = ({ children }: { children: ReactNode }) => {
                const methods = useForm({
                    defaultValues: {
                        first_step_id: null,
                        steps: {},
                    },
                })
                methods.setValue = mockSetValue

                return (
                    <FlowProvider
                        defaultNodes={[mockIncomingNode, mockEndNode]}
                    >
                        <FormProvider {...methods}>{children}</FormProvider>
                    </FlowProvider>
                )
            }
            mockGetNodes.mockReturnValue([mockIncomingNode, mockEndNode])

            const { result } = renderHook(
                () => useAddNode('incoming_call', 'end_call'),
                { wrapper: FormWrapper },
            )

            const newStep = mockPlayMessageStep({
                id: 'new-step',
                next_step_id: null,
            })

            act(() => {
                result.current.addNewStepInForm(newStep, mockIncomingNode)
            })

            // Since we can't easily access form values in the test,
            // we verify the function was called correctly by checking
            // that setNodes wasn't called with incorrect data
            expect(mockSetValue).toHaveBeenCalledWith(
                'first_step_id',
                'new-step',
            )
            expect(mockSetValue).toHaveBeenCalledWith('steps.new-step', newStep)
        })

        it('should link new step to existing steps', () => {
            const { result } = renderHook(
                () => useAddNode('source-node', 'end_call'),
                { wrapper: Wrapper },
            )

            const newStep = mockPlayMessageStep({
                id: 'new-step',
                next_step_id: 'end_call',
            })

            act(() => {
                result.current.addNewStepInForm(newStep, mockSourceNode)
            })

            expect(mockSetValue).toHaveBeenCalledWith('steps.new-step', newStep)
            expect(mockSetValue).toHaveBeenCalledWith(
                'steps.source-node',
                expect.objectContaining({
                    next_step_id: 'new-step',
                }),
            )
        })

        it('should handle intermediary nodes correctly', () => {
            const intermediaryNode: IntermediaryNode = {
                id: 'intermediary-1',
                type: VoiceFlowNodeType.Intermediary,
                data: { next_step_id: 'end_call' },
                position: { x: 0, y: 0 },
            }

            mockGetNodes.mockReturnValue([
                mockIncomingNode,
                mockSourceNode,
                intermediaryNode,
                mockEndNode,
            ])

            mockGetNode.mockImplementation((id: string) => {
                const nodes: Record<string, VoiceFlowNode> = {
                    'source-node': mockSourceNode,
                    'intermediary-1': intermediaryNode,
                    end_call: mockEndNode,
                }
                return nodes[id]
            })

            const { result } = renderHook(
                () => useAddNode('intermediary-1', 'end_call'),
                { wrapper: Wrapper },
            )

            const newStep = mockPlayMessageStep({
                id: 'new-step',
                next_step_id: 'end_call',
            })

            result.current.addNewStepInForm(newStep, intermediaryNode)

            expect(mockSetValue).toHaveBeenCalledWith('steps.new-step', newStep)
            expect(mockSetValue).toHaveBeenCalledWith(
                'first_step_id',
                'new-step',
            )
        })
    })
})
