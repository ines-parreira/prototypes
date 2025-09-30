import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

import { mockPlayMessageStep } from '@gorgias/helpdesk-mocks'

import { Form } from 'core/forms'
import { FlowProvider } from 'core/ui/flows'

import AddStepMenuContent from '../AddStepMenuContent'
import { VoiceFlowNodeType } from '../constants'
import { VoiceFlowNode } from '../types'

jest.mock('uuid', () => ({
    v4: jest.fn(() => 'new-node-id'),
}))
const mockSetNodes = jest.fn()
jest.mock('../useVoiceFlow', () => ({
    useVoiceFlow: () => ({
        ...jest.requireActual('../useVoiceFlow').useVoiceFlow(),
        setNodes: mockSetNodes,
    }),
}))

describe('AddStepMenuContent', () => {
    const mockStep = mockPlayMessageStep({
        id: 'source-node',
        next_step_id: null,
    })

    const mockInitialNode: VoiceFlowNode = {
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
        data: { ...mockStep, next_step_id: 'end_call' },
        position: { x: 0, y: 0 },
    }

    const mockTargetNode: VoiceFlowNode = {
        id: 'end_call',
        type: VoiceFlowNodeType.EndCall,
        data: {},
        position: { x: 0, y: 0 },
    }

    const renderComponent = (
        sourceNodeId: string = 'source-node',
        targetNodeId: string = 'end_call',
    ) => {
        return render(
            <FlowProvider
                defaultNodes={[mockInitialNode, mockSourceNode, mockTargetNode]}
            >
                <Form
                    defaultValues={{
                        first_step_id: mockStep.id,
                        steps: {
                            [mockStep.id]: mockStep,
                        },
                    }}
                    onValidSubmit={jest.fn()}
                >
                    <AddStepMenuContent
                        source={sourceNodeId}
                        target={targetNodeId}
                    />
                </Form>
            </FlowProvider>,
        )
    }

    describe('rendering options', () => {
        it('should render basic menu items', () => {
            renderComponent('incoming_call', 'source-node')

            expect(screen.getByText('Time rule')).toBeInTheDocument()
            expect(screen.getByText('Play message')).toBeInTheDocument()
            expect(screen.getByText('IVR Menu')).toBeInTheDocument()
            expect(screen.getByText('Route to')).toBeInTheDocument()
            expect(screen.queryByText('Send to SMS')).toBeNull()
            expect(screen.queryByText('Send to voicemail')).toBeNull()
            expect(screen.queryByText('Forward to')).toBeNull()
        })

        it('should render final node options when target points to EndCall', () => {
            renderComponent()

            expect(screen.getByText('Time rule')).toBeInTheDocument()
            expect(screen.getByText('Play message')).toBeInTheDocument()
            expect(screen.getByText('IVR Menu')).toBeInTheDocument()
            expect(screen.getByText('Route to')).toBeInTheDocument()
            expect(screen.getByText('Send to SMS')).toBeInTheDocument()
            expect(screen.getByText('Send to voicemail')).toBeInTheDocument()
            expect(screen.getByText('Forward to')).toBeInTheDocument()
        })
    })

    it('should handle adding a PlayMessage node', async () => {
        renderComponent()

        const playMessageButton = screen.getByText('Play message')
        act(() => {
            userEvent.click(playMessageButton)
        })

        await waitFor(() => {
            expect(mockSetNodes).toHaveBeenCalledWith([
                mockInitialNode,
                {
                    ...mockSourceNode,
                    data: {
                        ...mockSourceNode.data,
                        next_step_id: 'new-node-id',
                    },
                },
                {
                    id: 'new-node-id',
                    type: 'play_message',
                    data: {
                        id: 'new-node-id',
                        name: 'Play message',
                        step_type: 'play_message',
                        message: {
                            voice_message_type: 'text_to_speech',
                            text_to_speech_content: '',
                        },
                        next_step_id: 'end_call',
                    },
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                mockTargetNode,
            ])
        })
    })

    it('should handle adding a PlayMessage node as first', async () => {
        renderComponent('incoming_call', 'source-node')

        const playMessageButton = screen.getByText('Play message')
        act(() => {
            userEvent.click(playMessageButton)
        })

        await waitFor(() => {
            expect(mockSetNodes).toHaveBeenCalledWith([
                { ...mockInitialNode, data: { next_step_id: 'new-node-id' } },
                mockSourceNode,
                {
                    id: 'new-node-id',
                    type: 'play_message',
                    data: {
                        id: 'new-node-id',
                        name: 'Play message',
                        step_type: 'play_message',
                        message: {
                            voice_message_type: 'text_to_speech',
                            text_to_speech_content: '',
                        },
                        next_step_id: 'source-node',
                    },
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                mockTargetNode,
            ])
        })
    })
})
