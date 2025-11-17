import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

import { mockPlayMessageStep } from '@gorgias/helpdesk-mocks'

import { useFlag } from 'core/flags'
import { Form } from 'core/forms'
import { FlowProvider } from 'core/ui/flows'

import AddStepMenuContent from '../AddStepMenuContent'
import { VoiceFlowNodeType } from '../constants'
import type { VoiceFlowNode } from '../types'

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

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const useFlagMock = assumeMock(useFlag)

const mockUseAddNode = {
    addNode: jest.fn(),
    canAddFinalNode: true,
}
jest.mock(
    'pages/integrations/integration/components/voice/flows/utils/useAddNode',
    () => ({
        useAddNode: () => mockUseAddNode,
    }),
)

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

    beforeEach(() => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.ExtendedCallFlowsGAReady) return true
            return false
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('rendering options', () => {
        it('should render basic menu items', () => {
            mockUseAddNode.canAddFinalNode = false
            renderComponent('incoming_call', 'source-node')

            expect(screen.getByText('Customer lookup')).toBeInTheDocument()
            expect(screen.getByText('Time rule')).toBeInTheDocument()
            expect(screen.getByText('Play message')).toBeInTheDocument()
            expect(screen.getByText('IVR Menu')).toBeInTheDocument()
            expect(screen.getByText('Route to')).toBeInTheDocument()
            expect(screen.queryByText('Forward to')).toBeInTheDocument()
            expect(screen.queryByText('Send to SMS')).toBeNull()
            expect(screen.queryByText('Send to voicemail')).toBeNull()
        })

        it('should render final node options when target points to EndCall', () => {
            mockUseAddNode.canAddFinalNode = true
            renderComponent()

            expect(screen.getByText('Customer lookup')).toBeInTheDocument()
            expect(screen.getByText('Time rule')).toBeInTheDocument()
            expect(screen.getByText('Play message')).toBeInTheDocument()
            expect(screen.getByText('IVR Menu')).toBeInTheDocument()
            expect(screen.getByText('Route to')).toBeInTheDocument()
            expect(screen.getByText('Send to SMS')).toBeInTheDocument()
            expect(screen.getByText('Send to voicemail')).toBeInTheDocument()
            expect(screen.getByText('Forward to')).toBeInTheDocument()
        })

        it('should not render Customer lookup option when ExtendedCallFlowsGAReady is disabled', () => {
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.ExtendedCallFlowsGAReady)
                    return false
                return true
            })

            renderComponent()
            expect(
                screen.queryByText('Customer lookup'),
            ).not.toBeInTheDocument()
        })
    })

    it('should handle adding a PlayMessage node', async () => {
        renderComponent()

        const playMessageButton = screen.getByText('Play message')
        act(() => {
            userEvent.click(playMessageButton)
        })

        await waitFor(() => {
            expect(mockUseAddNode.addNode).toHaveBeenCalledWith(
                VoiceFlowNodeType.PlayMessage,
            )
        })
    })

    it('should handle adding a Forward to node', async () => {
        renderComponent()

        const forwardToButton = screen.getByText('Forward to')
        act(() => {
            userEvent.click(forwardToButton)
        })

        await waitFor(() => {
            expect(mockUseAddNode.addNode).toHaveBeenCalledWith(
                VoiceFlowNodeType.ForwardToExternalNumber,
            )
        })
    })
})
