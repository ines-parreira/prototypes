import React from 'react'

import { fireEvent, render, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { VoiceMessage, VoiceMessageType } from 'models/integration/types'
import { Account } from 'state/currentAccount/types'
import { RootState, StoreDispatch } from 'state/types'

import VoiceMessageField from '../VoiceMessageField'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

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

    it('should allow changing the text to speech text', () => {
        const { container } = render(
            <Provider store={mockStore({})}>
                <VoiceMessageField value={defaultMessage} onChange={onChange} />
            </Provider>,
        )
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

        const { container } = render(
            <Provider store={mockStore({})}>
                <VoiceMessageField value={defaultMessage} onChange={onChange} />
            </Provider>,
        )

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

        const { container } = render(
            <Provider store={mockStore({})}>
                <VoiceMessageField
                    maxRecordingDuration={5}
                    value={defaultMessage}
                    onChange={onChange}
                />
            </Provider>,
        )

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
        const { getByLabelText } = render(
            <Provider store={mockStore({})}>
                <VoiceMessageField
                    value={defaultMessage}
                    onChange={onChange}
                    allowNone
                />
            </Provider>,
        )

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
    }: {
        message?: VoiceMessage
        isDisabled?: boolean
    } = {}) => {
        return render(
            <Provider store={mockStore()}>
                <VoiceMessageField
                    value={message}
                    onChange={onChange}
                    allowNone
                    horizontal={true}
                    isDisabled={isDisabled}
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
})
