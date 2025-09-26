import { assumeMock } from '@repo/testing'
import { act, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {
    UploadedCustomRecording,
    useUploadCustomVoiceRecording,
} from '@gorgias/helpdesk-queries'
import { CustomRecordingType } from '@gorgias/helpdesk-types'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { VoiceMessage, VoiceMessageType } from 'models/integration/types'
import { Account } from 'state/currentAccount/types'
import { notify } from 'state/notifications/actions'
import { RootState, StoreDispatch } from 'state/types'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import DEPRECATED_VoiceMessageField from '../DEPRECATED_VoiceMessageField'

jest.mock('@gorgias/helpdesk-queries')
jest.mock('state/notifications/actions')

jest.mock('hooks/useAppDispatch', () => () => jest.fn())

const useUploadCustomVoiceRecordingMock = assumeMock(
    useUploadCustomVoiceRecording,
)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const mutateUploadMock = jest.fn()
const uploadResponse = () =>
    ({
        isLoading: false,
        mutate: mutateUploadMock,
    }) as unknown as ReturnType<typeof useUploadCustomVoiceRecording>

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
        useUploadCustomVoiceRecordingMock.mockReturnValue(uploadResponse())
        return renderWithQueryClientProvider(
            <Provider store={mockStore({})}>
                <DEPRECATED_VoiceMessageField
                    value={value}
                    onChange={onChange}
                    {...props}
                />
            </Provider>,
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
        return renderWithQueryClientProvider(
            <Provider store={mockStore()}>
                <DEPRECATED_VoiceMessageField
                    value={message}
                    onChange={onChange}
                    allowNone
                    horizontal={true}
                    isDisabled={isDisabled}
                    shouldUpload={shouldUpload}
                    customRecordingType={
                        CustomRecordingType.VoicemailNotification
                    }
                />
            </Provider>,
        )
    }

    beforeEach(() => {
        jest.resetAllMocks()
        window.URL.createObjectURL = jest.fn().mockReturnValue('fake-url')
        window.GORGIAS_STATE.currentAccount = {
            domain: 'acme',
        } as Account
        useUploadCustomVoiceRecordingMock.mockReturnValue(uploadResponse())
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
            act(() => {
                if (input) {
                    fireEvent.change(input, { target: { files: [file] } })
                }

                ;(
                    useUploadCustomVoiceRecordingMock as jest.MockedFunction<
                        typeof useUploadCustomVoiceRecording
                    >
                ).mock.calls[0][0]?.mutation?.onSuccess!(
                    axiosSuccessResponse<UploadedCustomRecording>({
                        url: 'https://example.com/voice-recording.mp3',
                        name: 'example.mp3',
                        content_type: 'audio/mpeg',
                        size: 23,
                    }),
                    '' as any,
                    '' as any,
                )
            })

            await waitFor(() => {
                expect(mutateUploadMock).toHaveBeenCalledWith({
                    data: { file },
                    params: {
                        type: CustomRecordingType.VoicemailNotification,
                    },
                })
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

            const { container } = renderWithUpload(message)
            act(() => {
                ;(
                    useUploadCustomVoiceRecordingMock as jest.MockedFunction<
                        typeof useUploadCustomVoiceRecording
                    >
                ).mock.calls[0][0]?.mutation?.onError!(
                    {
                        response: { data: { error: 'error' } },
                    },
                    '' as any,
                    '' as any,
                )
            })

            const input = container.querySelector('input[type="file"]')
            expect(input).toBeInTheDocument()
            if (input) {
                fireEvent.change(input, { target: { files: [file] } })
            }

            await waitFor(() => {
                expect(onChange).not.toHaveBeenCalled()
                expect(notify).toHaveBeenCalledWith({
                    status: 'error',
                    title: 'Failed to upload custom recording',
                })
            })
        })

        it('disabled the upload button when the file is uploading', () => {
            const mutateUploadMock = jest.fn()
            const uploadResponse = () =>
                ({
                    isLoading: true,
                    mutate: mutateUploadMock,
                }) as unknown as ReturnType<
                    typeof useUploadCustomVoiceRecording
                >

            useUploadCustomVoiceRecordingMock.mockReturnValue(uploadResponse())
            const message: VoiceMessage = {
                voice_message_type: VoiceMessageType.VoiceRecording,
            }

            const { getByText } = renderWithUpload(message)
            expect(
                getByText('Upload File').closest('button'),
            ).toBeAriaDisabled()
        })
    })
})
