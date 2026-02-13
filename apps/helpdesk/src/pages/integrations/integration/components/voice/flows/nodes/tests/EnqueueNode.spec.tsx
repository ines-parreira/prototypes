import type { ComponentProps } from 'react'

import { Form } from '@repo/forms'
import { assumeMock } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'

import {
    mockCallRoutingFlow,
    mockEnqueueStep,
    mockGetVoiceQueueHandler,
    mockListVoiceQueuesHandler,
} from '@gorgias/helpdesk-mocks'
import type { CallRoutingFlow, EnqueueStep } from '@gorgias/helpdesk-types'

import { FlowProvider } from 'core/ui/flows'
import { useDeleteNode } from 'pages/integrations/integration/components/voice/flows/utils/useDeleteNode'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import * as utils from '../../utils'
import { EnqueueNode } from '../EnqueueNode'

jest.mock(
    'pages/integrations/integration/components/voice/flows/utils/useDeleteNode',
)
jest.mock(
    'pages/integrations/integration/components/voice/VoiceMessageTTS/VoiceMessageTTSPreviewFields',
    () => () => <div>VoiceMessageTTSPreviewFields</div>,
)

const useDeleteNodeMock = assumeMock(useDeleteNode)
const mockDeleteEnqueueBranches = jest.fn()

const transformToReactFlowNodesSpy = jest.spyOn(
    utils,
    'transformToReactFlowNodes',
)

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

        useDeleteNodeMock.mockReturnValue({
            deleteEnqueueBranches: mockDeleteEnqueueBranches,
        } as unknown as ReturnType<typeof useDeleteNode>)
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

    it('renders all form sections with correct headers', () => {
        renderComponent(mockStep)

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

    it('should not render form fields when queue is not selected', () => {
        const step = mockEnqueueStep({
            queue_id: null!,
        })

        renderComponent(step)

        expect(
            screen.queryByText('Step 2: Handle busy times (Optional)'),
        ).not.toBeInTheDocument()
    })

    it('should call transformToReactFlowNodes when conditional routing is enabled', async () => {
        const user = userEvent.setup()

        const mockStep = mockEnqueueStep({
            conditional_routing: false,
            next_step_id: 'next-step',
        })
        renderComponent(mockStep)

        await act(async () => {
            await user.click(screen.getByText('Skip queue when it’s too busy'))
        })

        await waitFor(() => {
            expect(transformToReactFlowNodesSpy).toHaveBeenCalled()
        })

        expect(mockDeleteEnqueueBranches).not.toHaveBeenCalled()
    })

    it('should call deleteEnqueueBranches when conditional routing is disabled', async () => {
        const user = userEvent.setup()

        const mockStep = mockEnqueueStep({
            conditional_routing: true,
        })
        renderComponent(mockStep)

        await act(async () => {
            await user.click(screen.getByText('Skip queue when it’s too busy'))
        })

        await waitFor(() => {
            expect(mockDeleteEnqueueBranches).toHaveBeenCalled()
        })
    })
})
