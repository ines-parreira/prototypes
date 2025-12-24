import { Form, FormField, FormSubmitButton } from '@repo/forms'
import { assumeMock } from '@repo/testing'
import { act, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LegacyCheckBoxField as CheckBoxField } from '@gorgias/axiom'
import {
    mockEnqueueStep,
    mockIvrMenuStep,
    mockPlayMessageStep,
    mockSendToSMSStep,
} from '@gorgias/helpdesk-mocks'
import type { CallRoutingFlow, EnqueueStep } from '@gorgias/helpdesk-types'

import { VoiceFlowNodeType } from '../../constants'
import type { VoiceFlowNode } from '../../types'
import { useVoiceFlow } from '../../useVoiceFlow'
import { transformToReactFlowNodes } from '../../utils'
import { useDeleteNode } from '../useDeleteNode'

const mockUpdateNodes = jest.fn()
jest.mock(
    'pages/integrations/integration/components/voice/flows/hooks/useUpdateNodes',
    () => ({
        useUpdateNodes: () => mockUpdateNodes,
    }),
)

jest.mock('../../useVoiceFlow')

const useVoiceFlowMock = assumeMock(useVoiceFlow)
const onSubmit = jest.fn()

let useVoiceFlowReturnValue: ReturnType<typeof useVoiceFlow>

const renderHookWithMocks = (
    flow: CallRoutingFlow,
    initialNodes?: VoiceFlowNode[],
) => {
    const nodes = initialNodes || transformToReactFlowNodes(flow)

    useVoiceFlowReturnValue = {
        getNodes: jest.fn(() => nodes),
        getNode: jest.fn((id: string) => nodes.find((node) => node.id === id)),
        setNodes: jest.fn(),
    } as unknown as ReturnType<typeof useVoiceFlow>

    useVoiceFlowMock.mockReturnValue(useVoiceFlowReturnValue)

    return renderHook(() => useDeleteNode(), {
        wrapper: (props) => (
            <Form
                {...props}
                onValidSubmit={onSubmit}
                onInvalidSubmit={onSubmit}
                defaultValues={flow}
                mode="all"
            >
                {props.children}
                {Object.values(flow.steps)
                    .filter(
                        (step) => step.step_type === VoiceFlowNodeType.Enqueue,
                    )
                    .map((step) => (
                        <FormField
                            key={step.id}
                            name={`steps.${step.id}.conditional_routing`}
                            field={CheckBoxField}
                            label="Conditional routing"
                        />
                    ))}
                <FormSubmitButton>Submit</FormSubmitButton>
            </Form>
        ),
    })
}

describe('useDeleteNode', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

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

            const user = userEvent.setup()

            const { result } = renderHookWithMocks(flow)

            await act(async () => {
                result.current.deleteNode('first-step')
            })

            await waitFor(async () => {
                await user.click(screen.getByRole('button', { name: 'Submit' }))
            })
            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    {
                        first_step_id: null,
                        steps: {},
                    },
                    expect.any(Object),
                )
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

            const user = userEvent.setup()

            const { result } = renderHookWithMocks(flow)

            await act(async () => {
                result.current.deleteNode('second-step')
            })

            await waitFor(async () => {
                await user.click(screen.getByRole('button', { name: 'Submit' }))
            })

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    {
                        first_step_id: firstStep.id,
                        steps: {
                            [firstStep.id]: {
                                ...firstStep,
                                next_step_id: beforeEndCall.id,
                            },
                            [beforeEndCall.id]: beforeEndCall,
                        },
                    },
                    expect.any(Object),
                )
            })
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

            const user = userEvent.setup()

            const { result } = renderHookWithMocks(flow, nodes)

            await act(async () => {
                await result.current.deleteEnqueueBranches(enqueueStep.id)
            })

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Submit' }))
            })

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    {
                        first_step_id: firstStep.id,
                        steps: {
                            [firstStep.id]: firstStep,
                            [enqueueStep.id]: {
                                ...enqueueStep,
                                next_step_id: 'last-node',
                                skip_step_id: undefined,
                            },
                            [lastNode.id]: lastNode,
                        },
                    },
                    expect.any(Object),
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

            const user = userEvent.setup()

            const { result } = renderHookWithMocks(flow, nodes)

            await act(async () => {
                await result.current.deleteEnqueueBranches(enqueueStep.id)
            })

            await waitFor(async () => {
                await user.click(screen.getByLabelText('Conditional routing'))
            })

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Submit' }))
            })

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    {
                        first_step_id: firstStep.id,
                        steps: {
                            [firstStep.id]: firstStep,
                            [enqueueStep.id]: {
                                ...enqueueStep,
                                next_step_id: 'connector-step',
                                conditional_routing: false,
                                skip_step_id: undefined,
                            },
                            [connectorStep.id]: connectorStep,
                            [lastNode.id]: lastNode,
                        },
                    },
                    expect.any(Object),
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

            const user = userEvent.setup()

            const { result } = renderHookWithMocks(flow, nodes)

            await waitFor(async () => {
                await user.click(screen.getByLabelText('Conditional routing'))
            })

            await act(async () => {
                await result.current.deleteEnqueueBranches(enqueueStep.id)
            })

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Submit' }))
            })

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    {
                        first_step_id: firstStep.id,
                        steps: {
                            [firstStep.id]: firstStep,
                            [enqueueStep.id]: {
                                ...enqueueStep,
                                next_step_id: lastNode.id,
                                skip_step_id: undefined,
                                conditional_routing: false,
                            },
                            [lastNode.id]: lastNode,
                        },
                    },
                    expect.any(Object),
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

            const user = userEvent.setup()

            const { result } = renderHookWithMocks(flow, nodes)

            await waitFor(async () => {
                await user.click(screen.getByLabelText('Conditional routing'))
            })

            await act(async () => {
                await result.current.deleteEnqueueBranches(enqueueStep.id)
            })

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Submit' }))
            })

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    {
                        first_step_id: firstStep.id,
                        steps: {
                            [firstStep.id]: firstStep,
                            [enqueueStep.id]: {
                                ...enqueueStep,
                                next_step_id: lastNode.id,
                                skip_step_id: undefined,
                                conditional_routing: false,
                            },
                            [lastNode.id]: lastNode,
                        },
                    },
                    expect.any(Object),
                )
            })
        })
    })

    describe('removeUnlinkedSteps', () => {
        it('should remove steps that are not linked to the flow anymore', async () => {
            const firstStep = mockPlayMessageStep({
                id: 'first-step',
                next_step_id: 'second-step',
            })
            const secondStep = mockPlayMessageStep({
                id: 'second-step',
                next_step_id: 'third-step',
            })
            const thirdStep = mockPlayMessageStep({
                id: 'third-step',
                next_step_id: null,
            })
            const unlinkedStep = mockPlayMessageStep({
                id: 'unlinked-step',
                next_step_id: null,
            })
            const flow: CallRoutingFlow = {
                first_step_id: firstStep.id,
                steps: {
                    [firstStep.id]: firstStep,
                    [secondStep.id]: secondStep,
                    [thirdStep.id]: thirdStep,
                    [unlinkedStep.id]: unlinkedStep,
                },
            }

            const user = userEvent.setup()

            const { result } = renderHookWithMocks(flow)

            await act(async () => {
                await result.current.removeUnlinkedSteps()
            })

            await waitFor(async () => {
                await user.click(screen.getByRole('button', { name: 'Submit' }))
            })

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    {
                        first_step_id: 'first-step',
                        steps: {
                            [firstStep.id]: firstStep,
                            [secondStep.id]: secondStep,
                            [thirdStep.id]: thirdStep,
                        },
                    },
                    expect.any(Object),
                )
            })
        })
    })
})
