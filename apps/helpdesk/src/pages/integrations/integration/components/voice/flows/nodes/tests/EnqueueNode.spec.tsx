import { ComponentProps } from 'react'

import { screen } from '@testing-library/react'
import { setupServer } from 'msw/node'

import {
    mockCallRoutingFlow,
    mockEnqueueStep,
    mockGetVoiceQueueHandler,
    mockListVoiceQueuesHandler,
} from '@gorgias/helpdesk-mocks'
import { CallRoutingFlow, EnqueueStep } from '@gorgias/helpdesk-types'

import { Form } from 'core/forms'
import { FlowProvider } from 'core/ui/flows'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { EnqueueNode } from '../EnqueueNode'

const server = setupServer()
beforeAll(() => {
    server.listen()
})

afterAll(() => {
    server.close()
})

describe('EnqueueNode', () => {
    const mockStep = mockEnqueueStep({
        queue_id: 123,
    })

    beforeEach(() => {
        const mockGetVoiceQueue = mockGetVoiceQueueHandler()
        const mockListVoiceQueues = mockListVoiceQueuesHandler()

        server.use(mockGetVoiceQueue.handler)
        server.use(mockListVoiceQueues.handler)
    })

    afterEach(() => {
        server.resetHandlers()
    })

    const renderComponent = (mockStep: EnqueueStep, flow?: CallRoutingFlow) => {
        const mockFlow =
            flow ||
            mockCallRoutingFlow({
                first_step_id: mockStep.id,
                steps: { [mockStep.id]: mockStep },
            })

        const props = {
            data: mockStep,
        } as ComponentProps<typeof EnqueueNode>

        return renderWithStoreAndQueryClientProvider(
            <FlowProvider>
                <Form defaultValues={mockFlow} onValidSubmit={jest.fn()}>
                    <EnqueueNode {...props} />
                </Form>
            </FlowProvider>,
        )
    }

    it('renders with correct title and icon', () => {
        renderComponent(mockStep)

        expect(screen.getAllByText('Route to')).toHaveLength(2)
        expect(screen.getByText('Queue')).toBeInTheDocument()
        expect(screen.getByLabelText('arrow-routing')).toBeInTheDocument()
    })

    it('shows error when queue is not selected', () => {
        const mockStep = mockEnqueueStep({
            queue_id: null,
        } as any)
        renderComponent(mockStep)

        expect(screen.getByText('warning_amber')).toBeInTheDocument()
    })

    it('shows callback configuration when callback requests are enabled', () => {
        const mockStep = mockEnqueueStep({
            callback_requests: {
                enabled: true,
                prompt_message: {
                    voice_message_type: 'text_to_speech',
                    text_to_speech_content: 'Press 1 to request a callback',
                },
                confirmation_message: {
                    voice_message_type: 'text_to_speech',
                    text_to_speech_content: 'Callback confirmed',
                },
                allow_to_leave_voicemail: false,
            },
        })

        renderComponent(mockStep)

        expect(
            screen.getByText('First, inform callers about callbacks:'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Then, confirm their request:'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Allow callers to leave a voicemail after callback requests',
            ),
        ).toBeInTheDocument()
    })

    it('does not show callback configuration when callback requests are disabled', () => {
        const mockStep = mockEnqueueStep({
            callback_requests: {
                enabled: false,
            },
        })

        renderComponent(mockStep)

        expect(
            screen.queryByText('First, inform callers about callbacks:'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('Then, confirm their request:'),
        ).not.toBeInTheDocument()
    })

    it('shows error when callback requests are enabled but misconfigured', () => {
        const mockStep = mockEnqueueStep({
            queue_id: 123,
            callback_requests: {
                enabled: true,
                prompt_message: {
                    voice_message_type: 'text_to_speech',
                    text_to_speech_content: '',
                },
                confirmation_message: {
                    voice_message_type: 'voice_recording',
                    voice_recording_file_path: '',
                },
            },
        })

        renderComponent(mockStep)

        expect(screen.getByText('warning_amber')).toBeInTheDocument()
    })

    it('renders all form sections with correct headers', () => {
        renderComponent(mockStep)

        expect(
            screen.getByText('Step 1: Where should this call go?'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Select the queue you want your callers to be routed to:',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Step 2: Handle busy times (Optional)'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'When checked, calls skip the queue and go to the next step you configure on the Skip Queue branch:',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Step 3: Callback requests (Optional)'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'When checked, Callers keep their place in line and get called back when an agent is available.',
            ),
        ).toBeInTheDocument()
    })

    it('should not render node when form value does not exist', () => {
        const step = mockEnqueueStep()
        const flow = {
            steps: {},
        }

        renderComponent(step, flow as any)

        expect(screen.queryByText('Route to')).not.toBeInTheDocument()
    })
})
