import { render } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import configureMockStore from 'redux-mock-store'

import { mockUploadCustomVoiceRecordingHandler } from '@gorgias/helpdesk-mocks'
import { CustomRecordingType } from '@gorgias/helpdesk-types'

import type { VoiceMessage } from 'models/integration/types'
import { VoiceMessageType } from 'models/integration/types'
import type { Account } from 'state/currentAccount/types'
import type { RootState, StoreDispatch } from 'state/types'

import { DEPRECATED_VoiceMessageField } from '../DEPRECATED_VoiceMessageField'

jest.mock('hooks/useAppDispatch', () => ({ useAppDispatch: () => jest.fn() }))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const uploadVoiceRecordingResponse = {
    url: 'https://example.com/voice-recording.mp3',
    name: 'example.mp3',
    content_type: 'audio/mpeg',
    size: 23,
}
const server = setupServer(
    mockUploadCustomVoiceRecordingHandler(async () =>
        HttpResponse.json(uploadVoiceRecordingResponse),
    ).handler,
)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('<VoiceMessageField />', () => {
    const onChange: jest.MockedFunction<(value: VoiceMessage) => void> =
        jest.fn()
    const defaultMessage = {
        voice_message_type: VoiceMessageType.TextToSpeech,
        text_to_speech_content: 'Cannot answer right now',
    }
    beforeEach(() => {
        jest.resetAllMocks()
        window.URL.createObjectURL = jest.fn().mockReturnValue('fake-url')
        window.GORGIAS_STATE.currentAccount = {
            domain: 'acme',
        } as Account
    })
    const renderComponent = (
        value: VoiceMessage = defaultMessage,
        props = {},
    ) => {
        return render(
            <DEPRECATED_VoiceMessageField
                value={value}
                onChange={onChange}
                {...props}
            />,
            {
                storeState: mockStore({}).getState() as object,
            },
        )
    }
    it('should allow changing the text to speech text', () => {
        const { container } = renderComponent()
        const textarea = container.querySelector('textarea')
        if (textarea) {
            fireEvent.change(textarea, {
                target: { value: 'Please hold' },
            })
        }
        expect(onChange).toHaveBeenCalledWith({
            voice_message_type: VoiceMessageType.TextToSpeech,
            text_to_speech_content: 'Please hold',
            text_to_speech_recording_file_path: null,
        })
    })
    it('should allow inserting a custom recording', async () => {
        const file = new File(['audio data'], 'example.mp3', {
            type: 'audio/mpeg',
        })
        const defaultMessage: VoiceMessage = {
            voice_message_type: VoiceMessageType.VoiceRecording,
        }
        const { container } = renderComponent(defaultMessage)
        const input = container.querySelector('input[type="file"]')
        if (input) {
            fireEvent.change(input, { target: { files: [file] } })
        }
        await waitFor(() => {
            expect(onChange).toHaveBeenCalledWith({
                voice_message_type: VoiceMessageType.VoiceRecording,
                new_voice_recording_file:
                    'data:audio/mpeg;base64,YXVkaW8gZGF0YQ==',
                new_voice_recording_file_name: 'example.mp3',
                new_voice_recording_file_type: 'audio/mpeg',
            })
        })
        expect(container).toHaveTextContent('Supported file: .mp3 (Max 2MB)')
    })
    it('should validate custom recording duration if given a maxRecordingDuration prop', async () => {
        const file = new File(['audio data'], 'example.mp3', {
            type: 'audio/mpeg',
        })
        const defaultMessage: VoiceMessage = {
            voice_message_type: VoiceMessageType.VoiceRecording,
        }
        const { container } = renderComponent(defaultMessage, {
            maxRecordingDuration: 5,
        })
        const input = container.querySelector('input[type="file"]')
        if (input) {
            fireEvent.change(input, { target: { files: [file] } })
        }
        await expect(
            waitFor(() => {
                expect(onChange).toHaveBeenCalledWith({
                    voice_message_type: VoiceMessageType.VoiceRecording,
                    new_voice_recording_file:
                        'data:audio/mpeg;base64,YXVkaW8gZGF0YQ==',
                    new_voice_recording_file_name: 'example.mp3',
                    new_voice_recording_file_type: 'audio/mpeg',
                })
            }),
        ).rejects.toThrow()
    })
    it('should allow setting no voice message', () => {
        const { getByLabelText } = renderComponent(defaultMessage, {
            allowNone: true,
        })
        const noneOption = getByLabelText(/None/)
        fireEvent.click(noneOption)
        expect(onChange).toHaveBeenCalledWith({
            voice_message_type: VoiceMessageType.None,
            text_to_speech_content: 'Cannot answer right now',
        })
    })
})
describe('<VoiceMessageField horizontal="true" />', () => {
    const onChange: jest.MockedFunction<(value: VoiceMessage) => void> =
        jest.fn()
    const defaultMessage = {
        voice_message_type: VoiceMessageType.TextToSpeech,
        text_to_speech_content: 'Cannot answer right now',
    }
    const renderComponent = ({
        message = defaultMessage,
        isDisabled,
        shouldUpload = false,
    }: {
        message?: VoiceMessage
        isDisabled?: boolean
        shouldUpload?: boolean
    } = {}) => {
        return render(
            <DEPRECATED_VoiceMessageField
                value={message}
                onChange={onChange}
                allowNone
                horizontal={true}
                isDisabled={isDisabled}
                shouldUpload={shouldUpload}
                customRecordingType={CustomRecordingType.VoicemailNotification}
            />,
            {
                storeState: mockStore().getState() as object,
            },
        )
    }
    beforeEach(() => {
        jest.resetAllMocks()
        window.URL.createObjectURL = jest.fn().mockReturnValue('fake-url')
        window.GORGIAS_STATE.currentAccount = {
            domain: 'acme',
        } as Account
    })
    it('should render', () => {
        const { getByLabelText } = renderComponent()
        expect(getByLabelText('Text-to-speech')).toBeInTheDocument()
        expect(getByLabelText('Custom recording')).toBeInTheDocument()
        expect(getByLabelText('None')).toBeInTheDocument()
    })
    it('should allow changing the text to speech text', () => {
        const { container } = renderComponent()
        const textarea = container.querySelector('textarea')
        if (textarea) {
            fireEvent.change(textarea, {
                target: { value: 'Please hold' },
            })
        }
        expect(onChange).toHaveBeenCalledWith({
            voice_message_type: VoiceMessageType.TextToSpeech,
            text_to_speech_content: 'Please hold',
            text_to_speech_recording_file_path: null,
        })
    })
    it('should allow showing the text to speech text with empty text', () => {
        const message: VoiceMessage = {
            voice_message_type: VoiceMessageType.TextToSpeech,
            text_to_speech_content: null,
        }
        const { container, getByPlaceholderText } = renderComponent({ message })
        expect(
            getByPlaceholderText('Write a message to convert to speech'),
        ).toBeInTheDocument()
        const textarea = container.querySelector('textarea')
        expect(textarea).toBeInTheDocument()
        if (textarea) {
            fireEvent.change(textarea, {
                target: { value: 'Please hold' },
            })
        }
        expect(onChange).toHaveBeenCalledWith({
            voice_message_type: VoiceMessageType.TextToSpeech,
            text_to_speech_content: 'Please hold',
            text_to_speech_recording_file_path: null,
        })
    })
    it('should show error on no text to speech field provided', () => {
        const message = {
            voice_message_type: VoiceMessageType.TextToSpeech,
        } as VoiceMessage
        const { getByText } = renderComponent({ message })
        expect(
            getByText('Text-to-speech message is required'),
        ).toBeInTheDocument()
    })
    it('should allow inserting a custom recording', async () => {
        const file = new File(['audio data'], 'example.mp3', {
            type: 'audio/mpeg',
        })
        const message: VoiceMessage = {
            voice_message_type: VoiceMessageType.VoiceRecording,
        }
        const { container } = renderComponent({ message })
        const input = container.querySelector('input[type="file"]')
        expect(input).toBeInTheDocument()
        if (input) {
            fireEvent.change(input, { target: { files: [file] } })
        }
        await waitFor(() => {
            expect(onChange).toHaveBeenCalledWith({
                voice_message_type: VoiceMessageType.VoiceRecording,
                new_voice_recording_file:
                    'data:audio/mpeg;base64,YXVkaW8gZGF0YQ==',
                new_voice_recording_file_name: 'example.mp3',
                new_voice_recording_file_type: 'audio/mpeg',
            })
        })
        expect(container).toHaveTextContent('Supported file: .mp3 (Max 2MB)')
    })
    it('should allow setting no voice message', () => {
        const { getByLabelText } = renderComponent()
        const noneOption = getByLabelText(/None/)
        fireEvent.click(noneOption)
        expect(onChange).toHaveBeenCalledWith({
            voice_message_type: VoiceMessageType.None,
            text_to_speech_content: 'Cannot answer right now',
        })
    })
    it('should disable all options when isDisabled is true', () => {
        const { getByLabelText } = renderComponent({
            isDisabled: true,
        })
        const textToSpeechOption = getByLabelText('Text-to-speech')
        const customRecordingOption = getByLabelText('Custom recording')
        const noneOption = getByLabelText('None')
        expect(textToSpeechOption).toBeDisabled()
        expect(customRecordingOption).toBeDisabled()
        expect(noneOption).toBeDisabled()
    })
    describe('<VoiceMessageField /> uploads file', () => {
        const renderWithUpload = (message: VoiceMessage) => {
            return renderComponent({
                message,
                shouldUpload: true,
            })
        }
        it('should allow uploading a custom recording', async () => {
            const file = new File(['audio data'], 'example.mp3', {
                type: 'audio/mpeg',
            })
            const message: VoiceMessage = {
                voice_message_type: VoiceMessageType.VoiceRecording,
            }
            const { container } = renderWithUpload(message)
            const input = container.querySelector('input[type="file"]')
            expect(input).toBeInTheDocument()
            if (input) {
                fireEvent.change(input, { target: { files: [file] } })
            }

            await waitFor(() => {
                expect(onChange).toHaveBeenCalledWith({
                    voice_message_type: VoiceMessageType.VoiceRecording,
                    voice_recording_file_path:
                        'https://example.com/voice-recording.mp3',
                })
            })
        })
        it('should display error when uploading a custom recording', async () => {
            const file = new File(['audio data'], 'example.mp3', {
                type: 'audio/mpeg',
            })
            const message: VoiceMessage = {
                voice_message_type: VoiceMessageType.VoiceRecording,
            }
            server.use(
                mockUploadCustomVoiceRecordingHandler(async () =>
                    HttpResponse.json(null as never, { status: 500 }),
                ).handler,
            )
            const { container } = renderWithUpload(message)
            const input = container.querySelector('input[type="file"]')
            expect(input).toBeInTheDocument()
            if (input) {
                fireEvent.change(input, { target: { files: [file] } })
            }
            await waitFor(() => {
                expect(onChange).not.toHaveBeenCalled()
                const toast = screen.getByRole('status', {
                    name: 'Failed to upload custom recording',
                })
                expect(toast).toHaveAttribute('data-intent', 'destructive')
            })
        })
        it('disabled the upload button when the file is uploading', async () => {
            const file = new File(['audio data'], 'example.mp3', {
                type: 'audio/mpeg',
            })
            server.use(
                mockUploadCustomVoiceRecordingHandler(
                    () => new Promise(() => undefined),
                ).handler,
            )
            const message: VoiceMessage = {
                voice_message_type: VoiceMessageType.VoiceRecording,
            }
            const { container, getByText } = renderWithUpload(message)
            const input = container.querySelector('input[type="file"]')
            expect(input).toBeInTheDocument()
            if (input) {
                fireEvent.change(input, { target: { files: [file] } })
            }

            await waitFor(() => {
                expect(
                    getByText('Upload File').closest('button'),
                ).toBeAriaDisabled()
            })
        })
    })
})
