import { assumeMock, render } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockUploadCustomVoiceRecordingHandler,
    mockUploadCustomVoiceRecordingResponse,
} from '@gorgias/helpdesk-mocks'
import {
    VoiceQueueWaitMusicCustomRecordingTypeType,
    VoiceQueueWaitMusicLibraryTypeType,
} from '@gorgias/helpdesk-queries'

import { MAX_WAIT_MUSIC_CUSTOM_RECORDING_FILE_SIZE_MB } from 'models/integration/constants'
import type { LocalWaitMusicPreferences } from 'models/integration/types/phone'

import { useVoiceMessageValidation } from '../hooks/useVoiceMessageValidation'
import { WaitMusicField } from '../WaitMusicField'

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

const uploadCustomVoiceRecordingRequests: Request[] = []
const server = setupServer()

describe('<WaitMusicField />', () => {
    const onChange: jest.MockedFunction<
        (value: LocalWaitMusicPreferences) => void
    > = jest.fn()

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        onChange.mockReset()
        validateVoiceRecordingUploadMock.mockReset()
        uploadCustomVoiceRecordingRequests.length = 0
        server.use(
            mockUploadCustomVoiceRecordingHandler(async ({ request }) => {
                uploadCustomVoiceRecordingRequests.push(request)

                return HttpResponse.json(
                    mockUploadCustomVoiceRecordingResponse({
                        url: '123',
                        name: 'example1.mp3',
                        content_type: 'audio/mpeg',
                        size: 100,
                    }),
                )
            }).handler,
        )
        window.URL.createObjectURL = jest.fn().mockReturnValue('fake-url')
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should render', () => {
        const { queryByText } = render(
            <WaitMusicField
                value={{ type: VoiceQueueWaitMusicLibraryTypeType.Library }}
                onChange={onChange}
            />,
        )

        expect(queryByText('Choose from library')).toBeInTheDocument()
        expect(queryByText('Custom recording')).toBeInTheDocument()
    })

    it('should change wait music type to custom recording', () => {
        const { getByText } = render(
            <WaitMusicField
                value={{ type: VoiceQueueWaitMusicLibraryTypeType.Library }}
                onChange={onChange}
            />,
        )

        fireEvent.click(getByText('Custom recording'))

        expect(onChange).toHaveBeenCalledWith({
            type: VoiceQueueWaitMusicCustomRecordingTypeType.CustomRecording,
        })
    })

    it('should change wait music type to library', () => {
        const { getByText } = render(
            <WaitMusicField
                value={{
                    type: VoiceQueueWaitMusicCustomRecordingTypeType.CustomRecording,
                }}
                onChange={onChange}
            />,
        )

        fireEvent.click(getByText('Choose from library'))

        expect(onChange).toHaveBeenCalledWith({
            type: VoiceQueueWaitMusicLibraryTypeType.Library,
        })
    })

    it('should change library audio on select', async () => {
        const { getByText } = render(
            <WaitMusicField
                value={{ type: VoiceQueueWaitMusicLibraryTypeType.Library }}
                onChange={onChange}
            />,
        )

        fireEvent.click(getByText('arrow_drop_down'))
        fireEvent.click(getByText('Soothe'))

        await waitFor(() => {
            expect(onChange).toHaveBeenCalledWith({
                type: VoiceQueueWaitMusicLibraryTypeType.Library,
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

        const { container } = render(
            <WaitMusicField
                value={{
                    type: VoiceQueueWaitMusicCustomRecordingTypeType.CustomRecording,
                }}
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
            expect(uploadCustomVoiceRecordingRequests).toHaveLength(1)
        })

        await waitFor(() => {
            expect(onChange).toHaveBeenCalledWith({
                type: VoiceQueueWaitMusicCustomRecordingTypeType.CustomRecording,
                custom_recording: {
                    audio_file_path: '123',
                    audio_file_name: 'example1.mp3',
                    audio_file_type: 'audio/mpeg',
                },
            })
        })
    })

    it('should display error notification when uploading a custom recording fails', async () => {
        server.use(
            mockUploadCustomVoiceRecordingHandler(async () =>
                HttpResponse.json(mockUploadCustomVoiceRecordingResponse(), {
                    status: 500,
                }),
            ).handler,
        )
        const file = new File(['audio data'], 'example.mp3', {
            type: 'audio/mpeg',
        })
        validateVoiceRecordingUploadMock.mockResolvedValue({
            uploadedFile: file,
        })

        const { container } = render(
            <WaitMusicField
                value={{
                    type: VoiceQueueWaitMusicCustomRecordingTypeType.CustomRecording,
                }}
                onChange={onChange}
                shouldUpload
            />,
        )

        const input = container.querySelector('input[type="file"]')
        expect(input).toBeInTheDocument()
        if (input) {
            fireEvent.change(input, { target: { files: [file] } })
        }

        const toastEl = await screen.findByRole('status', {
            name: 'Failed to upload custom recording',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
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

        const { container } = render(
            <WaitMusicField
                value={{
                    type: VoiceQueueWaitMusicCustomRecordingTypeType.CustomRecording,
                }}
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
                type: VoiceQueueWaitMusicCustomRecordingTypeType.CustomRecording,
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
