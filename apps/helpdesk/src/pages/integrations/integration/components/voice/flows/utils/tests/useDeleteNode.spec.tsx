import { assumeMock } from '@repo/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import {
    mockIvrMenuStep,
    mockPlayMessageStep,
    mockSendToSMSStep,
} from '@gorgias/helpdesk-mocks'
import { CallRoutingFlow } from '@gorgias/helpdesk-types'

import { useFormContext } from 'core/forms'

import { useVoiceFlow } from '../../useVoiceFlow'
import { transformToReactFlowNodes } from '../../utils'
import { useDeleteNode } from '../useDeleteNode'

jest.mock('../../useVoiceFlow')
jest.mock('core/forms')

const useVoiceFlowMock = assumeMock(useVoiceFlow)
const useFormContextMock = assumeMock(useFormContext)

let useVoiceFlowReturnValue: ReturnType<typeof useVoiceFlow>
let useFormContextReturnValue: ReturnType<typeof useFormContext>

const renderHookWithMocks = (flow: CallRoutingFlow) => {
    const nodes = transformToReactFlowNodes(flow)

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
