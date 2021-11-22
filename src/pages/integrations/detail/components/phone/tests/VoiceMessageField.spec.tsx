import React from 'react'
import {render, fireEvent, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from '../../../../../../state/types'
import {
    VoiceMessageType,
    VoiceMessage,
} from '../../../../../../models/integration/types'

import VoiceMessageField from '../VoiceMessageField'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

describe('<VoiceMessageField />', () => {
    window.URL.createObjectURL = jest.fn()

    const onChange: jest.MockedFunction<(value: VoiceMessage) => void> =
        jest.fn()

    const defaultMessage = {
        voice_message_type: VoiceMessageType.TextToSpeech,
        text_to_speech_content: 'Cannot answer right now',
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render', () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <VoiceMessageField
                    value={defaultMessage}
                    onChange={onChange}
                    allowNone
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should allow changing the text to speech text', () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <VoiceMessageField value={defaultMessage} onChange={onChange} />
            </Provider>
        )
        const textarea = container.querySelector('textarea')
        if (textarea) {
            fireEvent.change(textarea, {
                target: {value: 'Please hold'},
            })
        }

        expect(onChange).toHaveBeenCalledWith({
            voice_message_type: VoiceMessageType.TextToSpeech,
            text_to_speech_content: 'Please hold',
        })
    })

    it('should allow inserting a voice recording', async () => {
        const file = new File(['image data'], 'example.mp3', {
            type: 'audio/mpeg',
        })

        const defaultMessage: VoiceMessage = {
            voice_message_type: VoiceMessageType.VoiceRecording,
        }

        const {container} = render(
            <Provider store={mockStore({})}>
                <VoiceMessageField value={defaultMessage} onChange={onChange} />
            </Provider>
        )

        const input = container.querySelector('input[type="file"]')
        if (input) {
            fireEvent.change(input, {target: {files: [file]}})
        }

        await waitFor(() => {
            expect(onChange).toHaveBeenCalledWith({
                voice_message_type: VoiceMessageType.VoiceRecording,
                new_voice_recording_file:
                    'data:audio/mpeg;base64,aW1hZ2UgZGF0YQ==',
                new_voice_recording_file_name: 'example.mp3',
                new_voice_recording_file_type: 'audio/mpeg',
            })
        })
    })

    it('should allow setting no voice message', () => {
        const {getByLabelText} = render(
            <Provider store={mockStore({})}>
                <VoiceMessageField
                    value={defaultMessage}
                    onChange={onChange}
                    allowNone
                />
            </Provider>
        )

        const noneOption = getByLabelText(/None/)
        fireEvent.click(noneOption)

        expect(onChange).toHaveBeenCalledWith({
            voice_message_type: VoiceMessageType.None,
            text_to_speech_content: 'Cannot answer right now',
        })
    })
})
