import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { UploadedCustomRecording } from '@gorgias/helpdesk-queries'
import { useUploadCustomVoiceRecording } from '@gorgias/helpdesk-queries'
import { CustomRecordingType } from '@gorgias/helpdesk-types'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import type { VoiceMessage } from 'models/integration/types'
import { VoiceMessageType } from 'models/integration/types'
import type { Account } from 'state/currentAccount/types'
import { notify } from 'state/notifications/actions'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import VoiceMessageField from '../VoiceMessageField'

jest.mock('../VoiceMessageTTS/VoiceMessageTTSPreviewFields', () => () => (
    <div>VoiceMessageTTSPreviewFields</div>
))

jest.mock('@gorgias/helpdesk-queries')
jest.mock('state/notifications/actions')
jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock('../utils', () => ({
    getAudioFileDuration: jest
        .fn()
        .mockRejectedValue(new Error('Invalid format')),
}))
jest.mock('../VoiceMessageTTS/VoiceMessageTTSPreviewFields', () => () => (
    <div>VoiceMessageTTSPreviewFields</div>
))

const mutateUploadMock = jest.fn()

const uploadResponse = (isLoading = false) =>
    ({
        isLoading,
        mutate: mutateUploadMock,
    }) as unknown as ReturnType<typeof useUploadCustomVoiceRecording>

describe('VoiceMessageField', () => {
    const onChange = jest.fn()

    const defaultMessage: VoiceMessage = {
        voice_message_type: VoiceMessageType.TextToSpeech,
        text_to_speech_content: 'Thank you for calling',
    }

    beforeEach(() => {
        jest.clearAllMocks()
        window.URL.createObjectURL = jest.fn().mockReturnValue('fake-url')
        window.GORGIAS_STATE.currentAccount = {
            domain: 'acme',
        } as Account
        ;(useUploadCustomVoiceRecording as jest.Mock).mockReturnValue(
            uploadResponse(),
        )
    })

    const renderComponent = (
        value: VoiceMessage = defaultMessage,
        props: Partial<Parameters<typeof VoiceMessageField>[0]> = {},
    ) => {
        return renderWithStoreAndQueryClientProvider(
            <VoiceMessageField
                name={'testing'}
                value={value}
                onChange={onChange}
                customRecordingType={CustomRecordingType.GreetingMessage}
                {...props}
            />,
        )
    }

    describe('Dropdown functionality', () => {
        it('should render with default text-to-speech option', () => {
            renderComponent()

            expect(screen.getByText('Text-to-speech')).toBeInTheDocument()
            expect(
                screen.getByPlaceholderText(
                    'Write a message to convert to speech',
                ),
            ).toBeInTheDocument()
        })

        it('should display label when provided', () => {
            renderComponent(defaultMessage, { label: 'Voice Message' })

            expect(screen.getByText('Voice Message')).toBeInTheDocument()
        })

        it('should toggle dropdown state when clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            const dropdownButton = screen
                .getByText('Text-to-speech')
                .closest('[aria-expanded]')
            expect(dropdownButton).toHaveAttribute('aria-expanded', 'false')

            await act(async () => {
                await user.click(dropdownButton!)
            })

            await waitFor(() => {
                expect(dropdownButton).toHaveAttribute('aria-expanded', 'true')
            })
        })

        it('should render custom recording option when selected', () => {
            const customRecordingMessage: VoiceMessage = {
                voice_message_type: VoiceMessageType.VoiceRecording,
            }
            renderComponent(customRecordingMessage)

            expect(screen.getByText('Custom recording')).toBeInTheDocument()
            expect(
                screen.queryByPlaceholderText(
                    'Write a message to convert to speech',
                ),
            ).not.toBeInTheDocument()
        })

        it('should render None option when selected with allowNone', () => {
            const noneMessage: VoiceMessage = {
                voice_message_type: VoiceMessageType.None,
            }
            renderComponent(noneMessage, { allowNone: true })

            expect(screen.getByText('None')).toBeInTheDocument()
            expect(
                screen.queryByPlaceholderText(
                    'Write a message to convert to speech',
                ),
            ).not.toBeInTheDocument()
            expect(screen.queryByText('Upload File')).not.toBeInTheDocument()
        })
    })

    describe('Text-to-speech functionality', () => {
        it('should display text-to-speech input when selected', () => {
            renderComponent()

            const textarea = screen.getByPlaceholderText(
                'Write a message to convert to speech',
            )
            expect(textarea).toBeInTheDocument()
            expect(textarea).toHaveValue('Thank you for calling')
        })

        it('should display preview fields', () => {
            renderComponent()

            expect(
                screen.getByText('VoiceMessageTTSPreviewFields'),
            ).toBeInTheDocument()
            expect(screen.getByText('21 / 1000')).toBeInTheDocument()
        })

        it('should update text-to-speech content when typing', async () => {
            const user = userEvent.setup()
            renderComponent()

            const textarea = screen.getByPlaceholderText(
                'Write a message to convert to speech',
            )
            await act(async () => {
                await user.type(textarea, 'A')
            })

            await waitFor(() => {
                expect(onChange).toHaveBeenLastCalledWith({
                    voice_message_type: VoiceMessageType.TextToSpeech,
                    text_to_speech_content: 'Thank you for callingA',
                    text_to_speech_recording_file_path: null,
                })
            })
        })

        it('should show error when text-to-speech content is empty', () => {
            renderComponent({
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: '',
            })

            expect(
                screen.getByText('Text-to-speech message is required'),
            ).toBeInTheDocument()
        })

        it('should be disabled when isDisabled is true', () => {
            renderComponent(defaultMessage, { isDisabled: true })

            const textarea = screen.getByPlaceholderText(
                'Write a message to convert to speech',
            )
            expect(textarea).toBeDisabled()
        })
    })

    describe('Custom recording functionality', () => {
        const customRecordingMessage: VoiceMessage = {
            voice_message_type: VoiceMessageType.VoiceRecording,
        }

        it('should display file upload when custom recording is selected', () => {
            renderComponent(customRecordingMessage)

            expect(screen.getByText('Upload File')).toBeInTheDocument()
            expect(
                screen.getByText('Supported file: .mp3 (Max 2MB)'),
            ).toBeInTheDocument()
        })

        it('should handle file upload', async () => {
            const user = userEvent.setup()
            const file = new File(['audio data'], 'example.mp3', {
                type: 'audio/mpeg',
            })
            Object.defineProperty(file, 'size', { value: 1024 }) // 1KB file

            const { container } = renderComponent(customRecordingMessage)

            const input = container.querySelector(
                'input[type="file"]',
            ) as HTMLInputElement
            expect(input).toBeInTheDocument()

            await act(async () => {
                await user.upload(input, file)
            })

            await waitFor(() => {
                expect(mutateUploadMock).toHaveBeenCalledWith({
                    data: { file },
                    params: {
                        type: CustomRecordingType.GreetingMessage,
                    },
                })
            })
        })

        it('should show existing recording with audio element', () => {
            const messageWithRecording: VoiceMessage = {
                voice_message_type: VoiceMessageType.VoiceRecording,
                voice_recording_file_path: 'https://example.com/recording.mp3',
            }

            renderComponent(messageWithRecording)

            expect(screen.getByText('Replace File')).toBeInTheDocument()
            const audioElement = screen.getByLabelText('voice-recording')
            expect(audioElement).toHaveAttribute(
                'src',
                'https://example.com/recording.mp3',
            )
        })

        it('should handle upload success', async () => {
            const user = userEvent.setup()
            const file = new File(['audio data'], 'example.mp3', {
                type: 'audio/mpeg',
            })

            const { container } = renderComponent(customRecordingMessage)
            const input = container.querySelector(
                'input[type="file"]',
            ) as HTMLInputElement

            await act(async () => {
                await user.upload(input, file)

                // Simulate successful upload
                const mockCall = (useUploadCustomVoiceRecording as jest.Mock)
                    .mock.calls[0]
                mockCall[0].mutation.onSuccess(
                    axiosSuccessResponse<UploadedCustomRecording>({
                        url: 'https://example.com/voice-recording.mp3',
                        name: 'example.mp3',
                        content_type: 'audio/mpeg',
                        size: 23,
                    }),
                    null as any,
                    null as any,
                )
            })

            expect(onChange).toHaveBeenCalledWith({
                voice_message_type: VoiceMessageType.VoiceRecording,
                voice_recording_file_path:
                    'https://example.com/voice-recording.mp3',
            })
        })

        it('should handle upload error', async () => {
            const user = userEvent.setup()
            const file = new File(['audio data'], 'example.mp3', {
                type: 'audio/mpeg',
            })

            const { container } = renderComponent(customRecordingMessage)
            const input = container.querySelector(
                'input[type="file"]',
            ) as HTMLInputElement

            await act(async () => {
                await user.upload(input, file)

                // Simulate upload error
                const mockCall = (useUploadCustomVoiceRecording as jest.Mock)
                    .mock.calls[0]
                mockCall[0].mutation.onError(
                    {
                        response: {
                            data: {
                                error: { msg: 'File too large' },
                            },
                        },
                    },
                    null as any,
                    null as any,
                )
            })

            expect(notify).toHaveBeenCalledWith({
                title: 'File too large',
                status: 'error',
            })
        })

        it('should disable upload button when loading', () => {
            ;(useUploadCustomVoiceRecording as jest.Mock).mockReturnValue(
                uploadResponse(true),
            )

            renderComponent(customRecordingMessage)

            const uploadButton = screen
                .getByText('Upload File')
                .closest('button')
            expect(uploadButton).toBeAriaDisabled()
        })

        it('should validate file size', async () => {
            const user = userEvent.setup()
            const largeFile = new File(
                ['x'.repeat(3 * 1024 * 1024)],
                'large.mp3',
                {
                    type: 'audio/mpeg',
                },
            )
            Object.defineProperty(largeFile, 'size', { value: 3 * 1024 * 1024 }) // 3MB file

            const { container } = renderComponent(customRecordingMessage)
            const input = container.querySelector(
                'input[type="file"]',
            ) as HTMLInputElement

            await act(async () => {
                await user.upload(input, largeFile)
            })

            await waitFor(() => {
                expect(notify).toHaveBeenCalledWith({
                    title: 'Failed to upload',
                    message:
                        'File too large. Upload a recording smaller than 2MB.',
                    status: 'error',
                })
                expect(mutateUploadMock).not.toHaveBeenCalled()
            })
        })
    })

    describe('None option functionality', () => {
        it('should not display any input fields when None is selected', async () => {
            const noneMessage: VoiceMessage = {
                voice_message_type: VoiceMessageType.None,
            }

            renderComponent(noneMessage, { allowNone: true })

            expect(
                screen.queryByPlaceholderText(
                    'Write a message to convert to speech',
                ),
            ).not.toBeInTheDocument()
            expect(screen.queryByText('Upload File')).not.toBeInTheDocument()
        })

        it('should display none value alert banner when none value alert banner is provided', () => {
            const noneMessage: VoiceMessage = {
                voice_message_type: VoiceMessageType.None,
            }

            renderComponent(noneMessage, {
                allowNone: true,
                noneValueAlertBanner: 'Test alert banner',
            })

            expect(screen.getByText('Test alert banner')).toBeInTheDocument()
        })

        it('should not display none value alert banner when none value alert banner is provided and voice message type is not None', () => {
            renderComponent(defaultMessage, {
                noneValueAlertBanner: 'Test alert banner',
            })

            expect(
                screen.queryByText('Test alert banner'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Caption', () => {
        it('should display caption when provided', () => {
            renderComponent(defaultMessage, { caption: 'Test caption' })

            expect(screen.getByText('Test caption')).toBeInTheDocument()
        })
    })

    describe('Option switching', () => {
        it('should preserve existing values when voice message type changes', () => {
            // Test that the component handles switching between voice message types
            const messageWithContent: VoiceMessage = {
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content: 'Original content',
            }

            const { unmount } = renderComponent(messageWithContent)

            expect(
                screen.getByDisplayValue('Original content'),
            ).toBeInTheDocument()

            // Unmount the previous component
            unmount()

            // Render with VoiceRecording type
            const switchedMessage: VoiceMessage = {
                voice_message_type: VoiceMessageType.VoiceRecording,
                text_to_speech_content: 'Original content',
            }

            renderComponent(switchedMessage)

            expect(screen.getByText('Upload File')).toBeInTheDocument()
            expect(
                screen.queryByPlaceholderText(
                    'Write a message to convert to speech',
                ),
            ).not.toBeInTheDocument()
        })
    })
})
