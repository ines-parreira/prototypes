import { act, renderHook, waitFor } from '@testing-library/react'

import { mockPlayMessageStep } from '@gorgias/helpdesk-mocks'

import { Form } from 'core/forms'
import { Flow, FlowProvider } from 'core/ui/flows'
import * as layoutUtils from 'core/ui/flows/layout.utils'

import {
    END_CALL_NODE,
    INCOMING_CALL_NODE,
    VoiceFlowNodeType,
} from '../../constants'
import { VoiceFlowNode } from '../../types'
import { useUpdateNodes } from '../useUpdateNodes'

const firstStep = mockPlayMessageStep({ id: '1', next_step_id: null })
const formValues = {
    first_step_id: firstStep.id,
    steps: {
        [firstStep.id]: firstStep,
    },
}

const getLayoutedElementsSpy = jest.spyOn(layoutUtils, 'getLayoutedElements')

const onNodesChange = jest.fn()
const onEdgesChange = jest.fn()

function Wrapper({ children }: { children: React.ReactNode }) {
    return (
        <FlowProvider>
            <Form defaultValues={formValues} onValidSubmit={jest.fn()}>
                <Flow
                    onEdgesChange={onEdgesChange}
                    onNodesChange={onNodesChange}
                    nodes={[]}
                    edges={[]}
                >
                    {children}
                </Flow>
            </Form>
        </FlowProvider>
    )
}

describe('useUpdateNodes', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should layout the nodes', async () => {
        const { result } = renderHook(() => useUpdateNodes(), {
            wrapper: ({ children }) => <Wrapper>{children}</Wrapper>,
        })

        act(() => {
            result.current()
        })

        const nodes: VoiceFlowNode[] = [
            expect.objectContaining({
                ...INCOMING_CALL_NODE,
                data: { next_step_id: firstStep.id },
            }),
            expect.objectContaining({
                id: firstStep.id,
                data: {
                    ...firstStep,
                    next_step_id: END_CALL_NODE.id,
                },
            }),
            expect.objectContaining(END_CALL_NODE),
        ]

        const edges = [
            expect.objectContaining({
                source: INCOMING_CALL_NODE.id,
                target: firstStep.id,
            }),
            expect.objectContaining({
                source: firstStep.id,
                target: END_CALL_NODE.id,
            }),
        ]

        await waitFor(() => {
            expect(getLayoutedElementsSpy).toHaveBeenCalledWith(
                nodes,
                edges,
                expect.any(Function),
            )
        })
        expect(onNodesChange).toHaveBeenCalledWith([
            {
                item: expect.objectContaining({
                    id: INCOMING_CALL_NODE.id,
                    data: {
                        next_step_id: firstStep.id,
                    },
                    position: expect.any(Object),
                }),
                index: 0,
                type: 'add',
            },
            {
                item: expect.objectContaining({
                    id: firstStep.id,
                    data: {
                        ...firstStep,
                        next_step_id: END_CALL_NODE.id,
                    },
                    position: expect.any(Object),
                }),
                index: 1,
                type: 'add',
            },
            {
                item: expect.objectContaining({
                    id: END_CALL_NODE.id,
                    type: VoiceFlowNodeType.EndCall,
                    position: expect.any(Object),
                }),
                index: 2,
                type: 'add',
            },
        ])
        expect(onEdgesChange).toHaveBeenCalledWith([
            {
                index: 0,
                item: {
                    id: `${INCOMING_CALL_NODE.id}->${firstStep.id}`,
                    source: INCOMING_CALL_NODE.id,
                    target: firstStep.id,
                },
                type: 'add',
            },
            {
                index: 1,
                item: {
                    id: `${firstStep.id}->${END_CALL_NODE.id}`,
                    source: firstStep.id,
                    target: END_CALL_NODE.id,
                },
                type: 'add',
            },
        ])
    })
})
