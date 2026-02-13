import type { ComponentProps } from 'react'

import { Form } from '@repo/forms'
import { screen } from '@testing-library/react'

import {
    mockCallRoutingFlow,
    mockSendToVoicemailStep,
} from '@gorgias/helpdesk-mocks'
import type {
    CallRoutingFlow,
    SendToVoicemailStep,
} from '@gorgias/helpdesk-types'

import { FlowProvider } from 'core/ui/flows'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import type { TextToSpeechContext as TextToSpeechContextType } from '../../../VoiceMessageTTS/TextToSpeechContext'
import TextToSpeechContext from '../../../VoiceMessageTTS/TextToSpeechContext'
import VoiceFlowProvider from '../../VoiceFlowProvider'
import { SendToVoicemailNode } from '../SendToVoicemailNode'

describe('SendToVoicemailNode', () => {
    const renderComponent = (
        mockFlow: CallRoutingFlow,
        mockStep: SendToVoicemailStep,
    ) => {
        const props = {
            id: mockStep.id,
            data: mockStep,
        } as ComponentProps<typeof SendToVoicemailNode>

        return renderWithStoreAndQueryClientProvider(
            <FlowProvider>
                <VoiceFlowProvider selectedNode={mockStep.id}>
                    <Form defaultValues={mockFlow} onValidSubmit={jest.fn()}>
                        <TextToSpeechContext.Provider
                            value={
                                {
                                    integrationId: 123,
                                } as TextToSpeechContextType
                            }
                        >
                            <SendToVoicemailNode {...props} />
                        </TextToSpeechContext.Provider>
                    </Form>
                </VoiceFlowProvider>
            </FlowProvider>,
        )
    }

    it('renders with StepCardIcon with correct props', () => {
        const mockStep = mockSendToVoicemailStep()
        const mockFlow = mockCallRoutingFlow({
            steps: { [mockStep.id]: mockStep },
        })
        renderComponent(mockFlow, mockStep)

        // The icon should be rendered as part of the step card
        // Check for the comm-voicemail icon
        const icon = screen.getByLabelText('comm-voicemail')
        expect(icon).toBeInTheDocument()
    })

    it('renders with info banner about voicemail being a final step', () => {
        const mockStep = mockSendToVoicemailStep()
        const mockFlow = mockCallRoutingFlow({
            steps: { [mockStep.id]: mockStep },
        })

        renderComponent(mockFlow, mockStep)

        expect(
            screen.getByText(
                'Voicemail is a final step, you cannot add any other steps after. Once the caller leaves a voicemail, the call ends.',
            ),
        ).toBeInTheDocument()
    })

    it('renders with text-to-speech voicemail message', () => {
        const mockStep = mockSendToVoicemailStep({
            voicemail: {
                voice_message_type: 'text_to_speech',
                text_to_speech_content:
                    'Please leave a message after the beep.',
            },
        })
        const mockFlow = mockCallRoutingFlow({
            steps: { [mockStep.id]: mockStep },
        })

        renderComponent(mockFlow, mockStep)

        // The title & message appears in both card and drawer
        expect(screen.getAllByText('Voicemail')).toHaveLength(2)
        expect(
            screen.getAllByText('Please leave a message after the beep.'),
        ).toHaveLength(2)
    })

    it('renders with voice recording voicemail message', () => {
        const mockStep = mockSendToVoicemailStep({
            voicemail: {
                voice_message_type: 'voice_recording',
                voice_recording_file_path: 'https://example.com/voicemail.mp3',
            },
        })
        const mockFlow = mockCallRoutingFlow({
            steps: { [mockStep.id]: mockStep },
        })

        renderComponent(mockFlow, mockStep)

        expect(screen.getAllByText('Voicemail')).toHaveLength(2)
        expect(screen.getAllByText('Custom recording')).toHaveLength(2)
    })

    it('shows error when text-to-speech content is empty', () => {
        const mockStep = mockSendToVoicemailStep({
            voicemail: {
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
        expect(screen.getByText('Add voicemail')).toBeInTheDocument()
    })

    it('shows error when voice recording is not selected', () => {
        const mockStep = mockSendToVoicemailStep({
            voicemail: {
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

    it('renders allow to leave voicemail checkbox', () => {
        const mockStep = mockSendToVoicemailStep({
            voicemail: {
                voice_message_type: 'text_to_speech',
                text_to_speech_content: 'Please leave a message.',
            },
            allow_to_leave_voicemail: true,
        })
        const mockFlow = mockCallRoutingFlow({
            steps: { [mockStep.id]: mockStep },
        })

        renderComponent(mockFlow, mockStep)

        // Check for the checkbox label
        expect(
            screen.getByText('Allow caller to leave a voicemail'),
        ).toBeInTheDocument()
        // Check for the caption
        expect(
            screen.getByText(
                'When selected, callers will hear the voicemail greeting and can leave a message.',
            ),
        ).toBeInTheDocument()
    })

    it('should not render anything when form value does not exist', () => {
        const mockStep = mockSendToVoicemailStep()
        const flow = {
            steps: {},
        }

        const { container } = renderComponent(flow as any, mockStep)

        expect(container.querySelector('div')).toBeNull()
    })
})
