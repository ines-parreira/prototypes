import { fireEvent, waitFor } from '@testing-library/react'

import { uploadCustomVoiceRecording } from '@gorgias/helpdesk-client'
import { CustomRecordingType, WaitMusicType } from '@gorgias/helpdesk-queries'

import { MAX_WAIT_MUSIC_CUSTOM_RECORDING_FILE_SIZE_MB } from 'models/integration/constants'
import { LocalWaitMusicPreferences } from 'models/integration/types/phone'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import useVoiceMessageValidation from '../hooks/useVoiceMessageValidation'
import WaitMusicField from '../WaitMusicField'

jest.mock('@gorgias/helpdesk-client')

const uploadCustomVoiceRecordingMock = assumeMock(uploadCustomVoiceRecording)

jest.mock(
    'pages/integrations/integration/components/voice/hooks/useVoiceMessageValidation',
)
const validateVoiceRecordingUploadMock = jest.fn()
assumeMock(useVoiceMessageValidation).mockReturnValue({
    validateVoiceRecordingUpload: validateVoiceRecordingUploadMock,
    canPayloadBeSubmitted: jest.fn(),
    cleanUpPayload: jest.fn(),
    isValidTextToSpeech: jest.fn(),
    cleanUpIvrPayload: jest.fn(),
    areVoiceMessagesTheSame: jest.fn(),
    areWaitMusicPreferencesTheSame: jest.fn(),
})

const mockNotify = {
    success: jest.fn(),
    error: jest.fn(),
}
jest.mock('hooks/useNotify', () => ({
    useNotify: () => mockNotify,
}))

describe('<WaitMusicField />', () => {
    const onChange: jest.MockedFunction<
        (value: LocalWaitMusicPreferences) => void
    > = jest.fn()

    beforeEach(() => {
        onChange.mockReset()
        validateVoiceRecordingUploadMock.mockReset()
        window.URL.createObjectURL = jest.fn().mockReturnValue('fake-url')
    })

    it('should render', () => {
        const { queryByText } = renderWithQueryClientProvider(
            <WaitMusicField
                value={{ type: WaitMusicType.Library }}
                onChange={onChange}
            />,
        )

        expect(queryByText('Choose from library')).toBeInTheDocument()
        expect(queryByText('Custom recording')).toBeInTheDocument()
    })

    it('should change wait music type to custom recording', () => {
        const { getByText } = renderWithQueryClientProvider(
            <WaitMusicField
                value={{ type: WaitMusicType.Library }}
                onChange={onChange}
            />,
        )

        fireEvent.click(getByText('Custom recording'))

        expect(onChange).toHaveBeenCalledWith({
            type: WaitMusicType.CustomRecording,
        })
    })

    it('should change wait music type to library', () => {
        const { getByText } = renderWithQueryClientProvider(
            <WaitMusicField
                value={{ type: WaitMusicType.CustomRecording }}
                onChange={onChange}
            />,
        )

        fireEvent.click(getByText('Choose from library'))

        expect(onChange).toHaveBeenCalledWith({
            type: WaitMusicType.Library,
        })
    })

    it('should change library audio on select', async () => {
        const { getByText } = renderWithQueryClientProvider(
            <WaitMusicField
                value={{ type: WaitMusicType.Library }}
                onChange={onChange}
            />,
        )

        fireEvent.click(getByText('arrow_drop_down'))
        fireEvent.click(getByText('Soothe'))

        await waitFor(() => {
            expect(onChange).toHaveBeenCalledWith({
                type: WaitMusicType.Library,
                library: {
                    key: 'soothe',
                    name: 'Soothe',
                    audio_file_path:
                        'https://assets.gorgias.io/phone/waiting_music_soothe.mp3',
                },
            })
        })
    })

    it('should allow uploading a custom recording', async () => {
        const file = new File(['audio data'], 'example.mp3', {
            type: 'audio/mpeg',
        })
        validateVoiceRecordingUploadMock.mockResolvedValue({
            uploadedFile: file,
        })
        uploadCustomVoiceRecordingMock.mockResolvedValue({
            data: {
                url: '123',
                name: 'example1.mp3',
                content_type: 'audio/mpeg',
                size: 100,
            },
        } as any)

        const { container } = renderWithQueryClientProvider(
            <WaitMusicField
                value={{ type: WaitMusicType.CustomRecording }}
                onChange={onChange}
                shouldUpload
            />,
        )

        const input = container.querySelector('input[type="file"]')
        expect(input).toBeInTheDocument()
        if (input) {
            fireEvent.change(input, { target: { files: [file] } })
        }

        await waitFor(() => {
            expect(uploadCustomVoiceRecordingMock).toHaveBeenCalledWith(
                { file },
                {
                    type: CustomRecordingType.WaitMusic,
                },
                undefined,
            )
        })

        await waitFor(() => {
            expect(onChange).toHaveBeenCalledWith({
                type: WaitMusicType.CustomRecording,
                custom_recording: {
                    audio_file_path: '123',
                    audio_file_name: 'example1.mp3',
                    audio_file_type: 'audio/mpeg',
                },
            })
        })
    })

    it('should display error notification when uploading a custom recording fails', async () => {
        uploadCustomVoiceRecordingMock.mockRejectedValue(
            new Error('Failed to upload'),
        )
        const file = new File(['audio data'], 'example.mp3', {
            type: 'audio/mpeg',
        })
        validateVoiceRecordingUploadMock.mockResolvedValue({
            uploadedFile: file,
        })

        const { container } = renderWithQueryClientProvider(
            <WaitMusicField
                value={{ type: WaitMusicType.CustomRecording }}
                onChange={onChange}
                shouldUpload
            />,
        )

        const input = container.querySelector('input[type="file"]')
        expect(input).toBeInTheDocument()
        if (input) {
            fireEvent.change(input, { target: { files: [file] } })
        }

        await waitFor(() => {
            expect(mockNotify.error).toHaveBeenCalledWith(
                'Failed to upload custom recording',
            )
        })
    })

    it('should allow uploading a custom recording - DEPRECATED', async () => {
        validateVoiceRecordingUploadMock.mockResolvedValue({
            url: 'd658ab4b-e36a-4b09-b6fe-d6e1ded91952',
            newVoiceFields: {
                new_voice_recording_file:
                    'data:audio/mpeg;base64,YXVkaW8gZGF0YQ==',
                new_voice_recording_file_name: 'example.mp3',
                new_voice_recording_file_type: 'audio/mpeg',
            },
        })

        const file = new File(['audio data'], 'example.mp3', {
            type: 'audio/mpeg',
        })

        const { container } = renderWithQueryClientProvider(
            <WaitMusicField
                value={{ type: WaitMusicType.CustomRecording }}
                onChange={onChange}
            />,
        )

        expect(container).toHaveTextContent('Supported file: .mp3 (Max 3MB)')

        const input = container.querySelector('input[type="file"]')
        expect(input).toBeInTheDocument()
        if (input) {
            fireEvent.change(input, { target: { files: [file] } })
        }

        await waitFor(() => {
            expect(onChange).toHaveBeenCalledWith({
                type: WaitMusicType.CustomRecording,
                custom_recording: {
                    audio_file: 'data:audio/mpeg;base64,YXVkaW8gZGF0YQ==',
                    audio_file_name: 'example.mp3',
                    audio_file_type: 'audio/mpeg',
                },
            })
            expect(validateVoiceRecordingUploadMock).toHaveBeenCalledWith(
                expect.anything(),
                undefined,
                MAX_WAIT_MUSIC_CUSTOM_RECORDING_FILE_SIZE_MB,
                true,
            )
        })
    })
})
