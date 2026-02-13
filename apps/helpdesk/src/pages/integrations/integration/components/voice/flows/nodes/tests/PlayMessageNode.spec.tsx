import type { ComponentProps } from 'react'

import { Form } from '@repo/forms'
import { screen } from '@testing-library/react'

import {
    mockCallRoutingFlow,
    mockPlayMessageStep,
} from '@gorgias/helpdesk-mocks'
import type { PlayMessageStep } from '@gorgias/helpdesk-types'

import { FlowProvider } from 'core/ui/flows'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import type { VoiceFlowFormValues } from '../../types'
import VoiceFlowProvider from '../../VoiceFlowProvider'
import { PlayMessageNode } from '../PlayMessageNode'

jest.mock(
    'pages/integrations/integration/components/voice/VoiceMessageTTS/VoiceMessageTTSPreviewFields',
    () => () => <div>VoiceMessageTTSPreviewFields</div>,
)

describe('PlayMessageNode', () => {
    const renderComponent = (
        mockFlow: VoiceFlowFormValues,
        mockStep: PlayMessageStep,
    ) => {
        const props = {
            id: mockStep.id,
            data: mockStep,
        } as ComponentProps<typeof PlayMessageNode>

        return renderWithStoreAndQueryClientProvider(
            <FlowProvider>
                <VoiceFlowProvider selectedNode={mockStep.id}>
                    <Form defaultValues={mockFlow} onValidSubmit={jest.fn()}>
                        <PlayMessageNode {...props} />
                    </Form>
                </VoiceFlowProvider>
            </FlowProvider>,
        )
    }

    it('renders with StepCardIcon with correct props', () => {
        const mockStep = mockPlayMessageStep()
        const mockFlow = mockCallRoutingFlow({
            steps: { [mockStep.id]: mockStep },
        })
        renderComponent(mockFlow, mockStep)

        // The icon should be rendered as part of the step card
        // Check for the media-play-circle icon
        const icon = screen.getByLabelText('media-play-circle')
        expect(icon).toBeInTheDocument()
    })

    it('renders with text-to-speech message', () => {
        const mockStep = mockPlayMessageStep({
            message: {
                voice_message_type: 'text_to_speech',
                text_to_speech_content: 'Hello, this is a test message.',
            },
        })
        const mockFlow = mockCallRoutingFlow({
            steps: { [mockStep.id]: mockStep },
        })

        renderComponent(mockFlow, mockStep)

        // The title & message appears in both card and drawer
        expect(screen.getAllByText('Play Message')).toHaveLength(2)
        expect(
            screen.getAllByText('Hello, this is a test message.'),
        ).toHaveLength(2)
    })

    it('renders with voice recording message', () => {
        const mockStep = mockPlayMessageStep({
            message: {
                voice_message_type: 'voice_recording',
                voice_recording_file_path: 'https://example.com/recording.mp3',
            },
        })
        const mockFlow = mockCallRoutingFlow({
            steps: { [mockStep.id]: mockStep },
        })

        renderComponent(mockFlow, mockStep)

        expect(screen.getAllByText('Play Message')).toHaveLength(2)
        expect(screen.getAllByText('Custom recording')).toHaveLength(2)
    })

    it('shows error when text-to-speech content is empty', () => {
        const mockStep = mockPlayMessageStep({
            message: {
                voice_message_type: 'text_to_speech',
                text_to_speech_content: '',
            },
        })
        const mockFlow = mockCallRoutingFlow({
            steps: { [mockStep.id]: mockStep },
        })

        renderComponent(mockFlow, mockStep)

        // Check for warning icon which indicates errors
        expect(
            screen.getByRole('img', { name: 'octagon-error' }),
        ).toBeInTheDocument()
        // Check that the description shows 'Message' (default text for empty content)
        expect(screen.getByText('Add message')).toBeInTheDocument()
    })

    it('shows error when voice recording is not selected', () => {
        const mockStep = mockPlayMessageStep({
            message: {
                voice_message_type: 'voice_recording',
                voice_recording_file_path: '',
            },
        })
        const mockFlow = mockCallRoutingFlow({
            steps: { [mockStep.id]: mockStep },
        })

        renderComponent(mockFlow, mockStep)

        // Check for warning icon which indicates errors
        expect(
            screen.getByRole('img', { name: 'octagon-error' }),
        ).toBeInTheDocument()
        // Check that the description shows 'Custom recording'
        expect(screen.getAllByText('Custom recording')).toHaveLength(2)
    })

    it('displays banner when recording inbound calls is enabled', () => {
        const mockStep = mockPlayMessageStep({
            message: {
                voice_message_type: 'text_to_speech',
                text_to_speech_content: 'Welcome message',
            },
        })
        const mockFlow = mockCallRoutingFlow({
            steps: { [mockStep.id]: mockStep },
        })

        renderComponent({ ...mockFlow, record_inbound_calls: true }, mockStep)

        expect(
            screen.getByText(
                'Call recording is enabled for inbound calls. To ensure transparency, consider adding a recording notification to your welcome message.',
            ),
        ).toBeInTheDocument()
    })

    it('does not display banner when recording inbound calls is disabled', () => {
        const mockStep = mockPlayMessageStep({
            message: {
                voice_message_type: 'text_to_speech',
                text_to_speech_content: 'Welcome message',
            },
        })
        const mockFlow = mockCallRoutingFlow({
            steps: { [mockStep.id]: mockStep },
        })

        renderComponent(mockFlow, mockStep)

        expect(
            screen.queryByText(
                'Call recording is enabled for inbound calls. To ensure transparency, consider adding a recording notification to your welcome message.',
            ),
        ).not.toBeInTheDocument()
    })

    it('does not render anything when form value does not exist', () => {
        const mockStep = mockPlayMessageStep()
        const mockFlow = {
            steps: {},
        }

        const { container } = renderComponent(mockFlow as any, mockStep)

        expect(container.querySelector('div')).toBeNull()
    })
})
