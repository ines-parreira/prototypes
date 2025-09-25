import { assumeMock } from '@repo/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import {
    mockEnqueueStep,
    mockIvrMenuStep,
    mockPlayMessageStep,
    mockSendToSMSStep,
} from '@gorgias/helpdesk-mocks'
import { CallRoutingFlow, EnqueueStep } from '@gorgias/helpdesk-types'

import { useFormContext } from 'core/forms'

import { VoiceFlowNodeType } from '../../constants'
import { VoiceFlowNode } from '../../types'
import { useVoiceFlow } from '../../useVoiceFlow'
import { transformToReactFlowNodes } from '../../utils'
import { useDeleteNode } from '../useDeleteNode'

jest.mock('../../useVoiceFlow')
jest.mock('core/forms')

const useVoiceFlowMock = assumeMock(useVoiceFlow)
const useFormContextMock = assumeMock(useFormContext)

let useVoiceFlowReturnValue: ReturnType<typeof useVoiceFlow>
let useFormContextReturnValue: ReturnType<typeof useFormContext>

const renderHookWithMocks = (
    flow: CallRoutingFlow,
    initialNodes?: VoiceFlowNode[],
) => {
    const nodes = initialNodes || transformToReactFlowNodes(flow)

    useVoiceFlowReturnValue = {
        getNodes: () => nodes,
        getNode: (id: string) => nodes.find((node) => node.id === id),
        setNodes: jest.fn(),
    } as unknown as ReturnType<typeof useVoiceFlow>

    useFormContextReturnValue = {
        watch: jest.fn(() => flow),
        setValue: jest.fn(),
        unregister: jest.fn(),
    } as unknown as ReturnType<typeof useFormContext>

    useVoiceFlowMock.mockReturnValue(useVoiceFlowReturnValue)
    useFormContextMock.mockReturnValue(useFormContextReturnValue)

    return renderHook(() => useDeleteNode())
}

describe('useDeleteNode', () => {
    describe('deleteNode', () => {
        it('should delete first step correctly', async () => {
            const flow = {
                first_step_id: 'first-step',
                steps: {
                    'first-step': mockPlayMessageStep({
                        id: 'first-step',
                        next_step_id: null,
                    }),
                },
            }

            const { result } = renderHookWithMocks(flow)

            await act(async () => {
                result.current.deleteNode('first-step')
            })

            await waitFor(() => {
                expect(useFormContextReturnValue.setValue).toHaveBeenCalledWith(
                    'steps',
                    {},
                    { shouldDirty: true },
                )
                expect(useFormContextReturnValue.setValue).toHaveBeenCalledWith(
                    'first_step_id',
                    null,
                )
                expect(useVoiceFlowReturnValue.setNodes).toHaveBeenCalledWith([
                    expect.objectContaining({
                        id: 'incoming_call',
                        data: {
                            next_step_id: 'end_call',
                        },
                    }),
                    expect.objectContaining({
                        id: 'end_call',
                    }),
                ])
            })
        })

        it('should delete a branching step correctly', async () => {
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
                next_step_id: 'before-end-call',
            })
            const branchOption2 = mockPlayMessageStep({
                id: 'branch-option-2',
                next_step_id: 'before-end-call',
            })
            const beforeEndCall = mockPlayMessageStep({
                id: 'before-end-call',
                next_step_id: null,
            })
            const flow: CallRoutingFlow = {
                first_step_id: firstStep.id,
                steps: {
                    [firstStep.id]: firstStep,
                    [secondStep.id]: secondStep,
                    [branchOption1.id]: branchOption1,
                    [branchOption2.id]: branchOption2,
                    [beforeEndCall.id]: beforeEndCall,
                },
            }

            const { result } = renderHookWithMocks(flow)

            await act(async () => {
                result.current.deleteNode('second-step')
            })

            await waitFor(() => {
                expect(useFormContextReturnValue.setValue).toHaveBeenCalledWith(
                    'steps',
                    {
                        [firstStep.id]: {
                            ...firstStep,
                            next_step_id: beforeEndCall.id,
                        },
                        [beforeEndCall.id]: {
                            ...beforeEndCall,
                            next_step_id: null,
                        },
                    },
                    { shouldDirty: true },
                )
                expect(useFormContextReturnValue.setValue).toHaveBeenCalledWith(
                    'first_step_id',
                    firstStep.id,
                )
                expect(useVoiceFlowReturnValue.setNodes).toHaveBeenCalledWith([
                    expect.objectContaining({
                        id: 'incoming_call',
                        data: {
                            next_step_id: firstStep.id,
                        },
                    }),
                    expect.objectContaining({
                        id: firstStep.id,
                        data: {
                            ...firstStep,
                            next_step_id: beforeEndCall.id,
                        },
                    }),
                    expect.objectContaining({
                        id: beforeEndCall.id,
                        data: {
                            ...beforeEndCall,
                            next_step_id: 'end_call',
                        },
                    }),
                    expect.objectContaining({
                        id: 'end_call',
                    }),
                ])
            })
        })
    })

    describe('deleteIvrBranch', () => {
        it('should delete a branch and its nodes correctly', async () => {
            const ivrMenuStep = mockIvrMenuStep({
                id: 'ivr-menu',
                branch_options: [
                    {
                        input_digit: '1',
                        next_step_id: 'branch-1-step-1',
                    },
                    {
                        input_digit: '2',
                        next_step_id: 'branch-2-step-1',
                    },
                    {
                        input_digit: '3',
                        next_step_id: 'branch-3-step-1',
                    },
                ],
            })
            const branch1Step1 = mockPlayMessageStep({
                id: 'branch-1-step-1',
                next_step_id: 'branch-1-step-2',
            })
            const branch1Step2 = mockSendToSMSStep({
                id: 'branch-1-step-2',
                next_step_id: 'end-node',
            })
            const branch2Step1 = mockPlayMessageStep({
                id: 'branch-2-step-1',
                next_step_id: 'end-node',
            })
            const branch3Step1 = mockSendToSMSStep({
                id: 'branch-3-step-1',
                next_step_id: 'end-node',
            })
            const endNode = mockPlayMessageStep({
                id: 'end-node',
                next_step_id: null,
            })

            const flow: CallRoutingFlow = {
                first_step_id: ivrMenuStep.id,
                steps: {
                    [ivrMenuStep.id]: ivrMenuStep,
                    [branch1Step1.id]: branch1Step1,
                    [branch1Step2.id]: branch1Step2,
                    [branch2Step1.id]: branch2Step1,
                    [branch3Step1.id]: branch3Step1,
                    [endNode.id]: endNode,
                },
            }

            const { result } = renderHookWithMocks(flow)

            await act(async () => {
                result.current.deleteIvrBranch(1, ivrMenuStep.id, endNode.id)
            })

            await waitFor(() => {
                expect(
                    useFormContextReturnValue.unregister,
                ).toHaveBeenCalledWith('steps.branch-2-step-1')

                const setNodesCallback = (
                    useVoiceFlowReturnValue.setNodes as jest.Mock
                ).mock.calls[0][0]
                const updatedNodes = setNodesCallback(
                    useVoiceFlowReturnValue.getNodes(),
                )

                const remainingNodeIds = updatedNodes.map((n: any) => n.id)
                expect(remainingNodeIds).not.toContain('branch-2-step-1')

                const updatedIvrOptions = updatedNodes.filter(
                    (n: any) =>
                        n.type === VoiceFlowNodeType.IvrOption &&
                        n.data.parentId === ivrMenuStep.id,
                )

                const option0 = updatedIvrOptions.find(
                    (n: any) => n.data.optionIndex === 0,
                )
                const option1 = updatedIvrOptions.find(
                    (n: any) => n.data.optionIndex === 1,
                )

                expect(option0).toBeDefined()
                expect(option1).toBeDefined()
                expect(
                    updatedIvrOptions.find(
                        (n: any) => n.data.optionIndex === 2,
                    ),
                ).toBeUndefined()
            })
        })

        it('should delete a branch with multiple steps in the subflow', async () => {
            const ivrMenuStep = mockIvrMenuStep({
                id: 'ivr-menu',
                branch_options: [
                    {
                        input_digit: '1',
                        next_step_id: 'branch-1-step-1',
                    },
                    {
                        input_digit: '2',
                        next_step_id: 'branch-2-step-1',
                    },
                ],
            })
            const branch1Step1 = mockPlayMessageStep({
                id: 'branch-1-step-1',
                next_step_id: 'branch-1-step-2',
            })
            const branch1Step2 = mockPlayMessageStep({
                id: 'branch-1-step-2',
                next_step_id: 'branch-1-step-3',
            })
            const branch1Step3 = mockSendToSMSStep({
                id: 'branch-1-step-3',
                next_step_id: 'end-node',
            })
            const branch2Step1 = mockPlayMessageStep({
                id: 'branch-2-step-1',
                next_step_id: 'end-node',
            })
            const endNode = mockPlayMessageStep({
                id: 'end-node',
                next_step_id: null,
            })

            const flow: CallRoutingFlow = {
                first_step_id: ivrMenuStep.id,
                steps: {
                    [ivrMenuStep.id]: ivrMenuStep,
                    [branch1Step1.id]: branch1Step1,
                    [branch1Step2.id]: branch1Step2,
                    [branch1Step3.id]: branch1Step3,
                    [branch2Step1.id]: branch2Step1,
                    [endNode.id]: endNode,
                },
            }

            const { result } = renderHookWithMocks(flow)

            await act(async () => {
                result.current.deleteIvrBranch(0, ivrMenuStep.id, endNode.id)
            })

            await waitFor(() => {
                expect(
                    useFormContextReturnValue.unregister,
                ).toHaveBeenCalledWith('steps.branch-1-step-1')
                expect(
                    useFormContextReturnValue.unregister,
                ).toHaveBeenCalledWith('steps.branch-1-step-2')
                expect(
                    useFormContextReturnValue.unregister,
                ).toHaveBeenCalledWith('steps.branch-1-step-3')

                const setNodesCallback = (
                    useVoiceFlowReturnValue.setNodes as jest.Mock
                ).mock.calls[0][0]
                const updatedNodes = setNodesCallback(
                    useVoiceFlowReturnValue.getNodes(),
                )

                const remainingNodeIds = updatedNodes.map((n: any) => n.id)
                expect(remainingNodeIds).not.toContain('branch-1-step-1')
                expect(remainingNodeIds).not.toContain('branch-1-step-2')
                expect(remainingNodeIds).not.toContain('branch-1-step-3')

                const remainingIvrOption = updatedNodes.find(
                    (n: any) =>
                        n.type === VoiceFlowNodeType.IvrOption &&
                        n.data.parentId === ivrMenuStep.id,
                )
                expect(remainingIvrOption.data.optionIndex).toBe(0)
            })
        })

        it('should correctly decrement option indices after deleted branch', async () => {
            const ivrMenuStep = mockIvrMenuStep({
                id: 'ivr-menu',
                branch_options: [
                    {
                        input_digit: '1',
                        next_step_id: 'branch-1-step',
                    },
                    {
                        input_digit: '2',
                        next_step_id: 'branch-2-step',
                    },
                    {
                        input_digit: '3',
                        next_step_id: 'branch-3-step',
                    },
                    {
                        input_digit: '4',
                        next_step_id: 'branch-4-step',
                    },
                ],
            })
            const branch1Step = mockPlayMessageStep({
                id: 'branch-1-step',
                next_step_id: 'end-node',
            })
            const branch2Step = mockPlayMessageStep({
                id: 'branch-2-step',
                next_step_id: 'end-node',
            })
            const branch3Step = mockPlayMessageStep({
                id: 'branch-3-step',
                next_step_id: 'end-node',
            })
            const branch4Step = mockPlayMessageStep({
                id: 'branch-4-step',
                next_step_id: 'end-node',
            })
            const endNode = mockPlayMessageStep({
                id: 'end-node',
                next_step_id: null,
            })

            const flow: CallRoutingFlow = {
                first_step_id: ivrMenuStep.id,
                steps: {
                    [ivrMenuStep.id]: ivrMenuStep,
                    [branch1Step.id]: branch1Step,
                    [branch2Step.id]: branch2Step,
                    [branch3Step.id]: branch3Step,
                    [branch4Step.id]: branch4Step,
                    [endNode.id]: endNode,
                },
            }

            const { result } = renderHookWithMocks(flow)

            await act(async () => {
                result.current.deleteIvrBranch(1, ivrMenuStep.id, endNode.id)
            })

            await waitFor(() => {
                const setNodesCallback = (
                    useVoiceFlowReturnValue.setNodes as jest.Mock
                ).mock.calls[0][0]
                const updatedNodes = setNodesCallback(
                    useVoiceFlowReturnValue.getNodes(),
                )

                const updatedIvrOptions = updatedNodes
                    .filter(
                        (n: any) =>
                            n.type === VoiceFlowNodeType.IvrOption &&
                            n.data.parentId === ivrMenuStep.id,
                    )
                    .sort(
                        (a: any, b: any) =>
                            a.data.optionIndex - b.data.optionIndex,
                    )

                expect(updatedIvrOptions).toHaveLength(3)
                expect(updatedIvrOptions[0].data.optionIndex).toBe(0)
                expect(updatedIvrOptions[1].data.optionIndex).toBe(1)
                expect(updatedIvrOptions[2].data.optionIndex).toBe(2)
            })
        })

        it('should handle deletion when option node is not found', async () => {
            const flow: CallRoutingFlow = {
                first_step_id: 'ivr-menu',
                steps: {
                    'ivr-menu': mockIvrMenuStep({
                        id: 'ivr-menu',
                        branch_options: [],
                    }),
                },
            }

            const { result } = renderHookWithMocks(flow)

            await act(async () => {
                result.current.deleteIvrBranch(0, 'ivr-menu', 'end-node')
            })

            expect(useVoiceFlowReturnValue.setNodes).not.toHaveBeenCalled()
            expect(useFormContextReturnValue.unregister).not.toHaveBeenCalled()
        })
    })

    describe('deleteEnqueueBranches', () => {
        it('should only delete enqueue branches but not the enqueue node', async () => {
            const firstStep = mockPlayMessageStep({
                id: 'first-step',
                next_step_id: 'enqueue-1',
            })
            const enqueueStep = mockEnqueueStep({
                id: 'enqueue-1',
                next_step_id: 'default-branch-step',
                skip_step_id: 'skip-branch-step',
                conditional_routing: true,
            })
            const defaultBranchStep = mockPlayMessageStep({
                id: 'default-branch-step',
                next_step_id: 'last-node',
            })
            const skipBranchStep = mockPlayMessageStep({
                id: 'skip-branch-step',
                next_step_id: 'last-node',
            })
            const lastNode = mockPlayMessageStep({
                id: 'last-node',
                next_step_id: null,
            })
            const flow: CallRoutingFlow = {
                first_step_id: firstStep.id,
                steps: {
                    [firstStep.id]: firstStep,
                    [enqueueStep.id]: enqueueStep,
                    [defaultBranchStep.id]: defaultBranchStep,
                    [skipBranchStep.id]: skipBranchStep,
                    [lastNode.id]: lastNode,
                },
            }

            const nodes = transformToReactFlowNodes(flow)
            ;(flow.steps[enqueueStep.id] as EnqueueStep).conditional_routing =
                false

            const { result } = renderHookWithMocks(flow, nodes)

            await act(async () => {
                await result.current.deleteEnqueueBranches(enqueueStep.id)
            })

            await waitFor(() => {
                expect(
                    useFormContextReturnValue.unregister,
                ).toHaveBeenCalledWith('steps.default-branch-step')
                expect(
                    useFormContextReturnValue.unregister,
                ).toHaveBeenCalledWith('steps.skip-branch-step')
                // check that we only have the incoming, first step, enqueue, last node and end call nodes
                expect(useFormContextReturnValue.setValue).toHaveBeenCalledWith(
                    'steps',
                    {
                        [firstStep.id]: firstStep,
                        [enqueueStep.id]: {
                            ...enqueueStep,
                            next_step_id: 'last-node',
                            skip_step_id: undefined,
                        },
                        [lastNode.id]: lastNode,
                    },
                    { shouldDirty: true },
                )
            })
        })

        it('should only remove link to skip step when branches are empty', async () => {
            const firstStep = mockPlayMessageStep({
                id: 'first-step',
                next_step_id: 'enqueue-1',
            })
            const enqueueStep = mockEnqueueStep({
                id: 'enqueue-1',
                next_step_id: 'connector-step',
                skip_step_id: 'connector-step',
                conditional_routing: true,
            })
            const connectorStep = mockPlayMessageStep({
                id: 'connector-step',
                next_step_id: 'last-node',
            })
            const lastNode = mockPlayMessageStep({
                id: 'last-node',
                next_step_id: null,
            })

            const flow: CallRoutingFlow = {
                first_step_id: firstStep.id,
                steps: {
                    [firstStep.id]: firstStep,
                    [enqueueStep.id]: enqueueStep,
                    [connectorStep.id]: connectorStep,
                    [lastNode.id]: lastNode,
                },
            }

            const nodes = transformToReactFlowNodes(flow)
            ;(flow.steps[enqueueStep.id] as EnqueueStep).conditional_routing =
                false

            const { result } = renderHookWithMocks(flow, nodes)

            await act(async () => {
                await result.current.deleteEnqueueBranches(enqueueStep.id)
            })

            await waitFor(() => {
                expect(useFormContextReturnValue.setValue).toHaveBeenCalledWith(
                    'steps',
                    {
                        [firstStep.id]: firstStep,
                        [enqueueStep.id]: {
                            ...enqueueStep,
                            next_step_id: 'connector-step',
                            skip_step_id: undefined,
                        },
                        [connectorStep.id]: connectorStep,
                        [lastNode.id]: lastNode,
                    },
                    { shouldDirty: true },
                )
            })
        })

        it('should delete default branch correctly when skip branch is empty', async () => {
            const firstStep = mockPlayMessageStep({
                id: 'first-step',
                next_step_id: 'enqueue-1',
            })
            const enqueueStep = mockEnqueueStep({
                id: 'enqueue-1',
                next_step_id: 'default-branch-step',
                skip_step_id: 'last-node',
                conditional_routing: true,
            })
            const defaultBranchStep = mockPlayMessageStep({
                id: 'default-branch-step',
                next_step_id: 'last-node',
            })
            const lastNode = mockPlayMessageStep({
                id: 'last-node',
                next_step_id: null,
            })

            const flow: CallRoutingFlow = {
                first_step_id: firstStep.id,
                steps: {
                    [firstStep.id]: firstStep,
                    [enqueueStep.id]: enqueueStep,
                    [defaultBranchStep.id]: defaultBranchStep,
                    [lastNode.id]: lastNode,
                },
            }

            const nodes = transformToReactFlowNodes(flow)
            ;(flow.steps[enqueueStep.id] as EnqueueStep).conditional_routing =
                false

            const { result } = renderHookWithMocks(flow, nodes)

            await act(async () => {
                await result.current.deleteEnqueueBranches(enqueueStep.id)
            })

            await waitFor(() => {
                expect(useFormContextReturnValue.setValue).toHaveBeenCalledWith(
                    'steps',
                    {
                        [firstStep.id]: firstStep,
                        [enqueueStep.id]: {
                            ...enqueueStep,
                            next_step_id: lastNode.id,
                            skip_step_id: undefined,
                        },
                        [lastNode.id]: lastNode,
                    },
                    { shouldDirty: true },
                )
            })
        })

        it('should delete skip branch correctly when default branch is empty', async () => {
            const firstStep = mockPlayMessageStep({
                id: 'first-step',
                next_step_id: 'enqueue-1',
            })
            const enqueueStep = mockEnqueueStep({
                id: 'enqueue-1',
                next_step_id: 'default-branch-step',
                skip_step_id: 'last-node',
                conditional_routing: true,
            })
            const defaultBranchStep = mockPlayMessageStep({
                id: 'default-branch-step',
                next_step_id: 'last-node',
            })
            const lastNode = mockPlayMessageStep({
                id: 'last-node',
                next_step_id: null,
            })

            const flow: CallRoutingFlow = {
                first_step_id: firstStep.id,
                steps: {
                    [firstStep.id]: firstStep,
                    [enqueueStep.id]: enqueueStep,
                    [defaultBranchStep.id]: defaultBranchStep,
                    [lastNode.id]: lastNode,
                },
            }

            const nodes = transformToReactFlowNodes(flow)
            ;(flow.steps[enqueueStep.id] as EnqueueStep).conditional_routing =
                false

            const { result } = renderHookWithMocks(flow, nodes)

            await act(async () => {
                await result.current.deleteEnqueueBranches(enqueueStep.id)
            })

            await waitFor(() => {
                expect(useFormContextReturnValue.setValue).toHaveBeenCalledWith(
                    'steps',
                    {
                        [firstStep.id]: firstStep,
                        [enqueueStep.id]: {
                            ...enqueueStep,
                            next_step_id: lastNode.id,
                            skip_step_id: undefined,
                        },
                        [lastNode.id]: lastNode,
                    },
                    { shouldDirty: true },
                )
            })
        })
    })
})
