import { Form } from '@repo/forms'
import { assumeMock } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockSynthesizeSpeechPreviewHandler } from '@gorgias/helpdesk-mocks'
import type { VoiceMessageTextToSpeech } from '@gorgias/helpdesk-queries'
import { VoiceGender, VoiceLanguage } from '@gorgias/helpdesk-types'

import useAppSelector from 'hooks/useAppSelector'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import TextToSpeechProvider from '../TextToSpeechProvider'
import VoiceMessageTTSPreviewButton from '../VoiceMessageTTSPreviewButton'

// Mock the replaceAttachmentURL utility
jest.mock('utils', () => ({
    replaceAttachmentURL: (url: string) => url,
}))

const mockNotify = {
    success: jest.fn(),
    error: jest.fn(),
}
jest.mock('hooks/useNotify', () => ({
    useNotify: () => mockNotify,
}))
jest.mock('@gorgias/realtime')

jest.mock('state/currentAccount/selectors', () => ({
    getCurrentAccountId: jest.fn(),
}))

jest.mock('state/currentUser/selectors', () => ({
    getCurrentUserId: jest.fn(),
}))

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = assumeMock(useAppSelector)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
    mockUseAppSelector.mockImplementation(() => {
        return '1'
    })
})

beforeEach(() => {
    server.use(mockSynthesizeSpeechPreviewHandler().handler)
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

describe('VoiceMessageTTSPreviewButton', () => {
    const mockValue: VoiceMessageTextToSpeech = {
        voice_message_type: 'text_to_speech',
        text_to_speech_content: 'Hello, this is a test message',
        text_to_speech_recording_file_path: null,
        language: VoiceLanguage.EnUs,
        gender: VoiceGender.Female,
    }

    const mockValueWithFile: VoiceMessageTextToSpeech = {
        ...mockValue,
        text_to_speech_recording_file_path: 'https://example.com/audio.mp3',
    }

    const renderComponent = (value: VoiceMessageTextToSpeech) => {
        return renderWithQueryClientProvider(
            <Form defaultValues={{ testing: value }} onValidSubmit={jest.fn()}>
                <TextToSpeechProvider integrationId={1}>
                    <VoiceMessageTTSPreviewButton fieldName={'testing'} />
                </TextToSpeechProvider>
            </Form>,
        )
    }

    describe('rendering', () => {
        it('should render the preview button', () => {
            renderComponent(mockValue)

            expect(
                screen.getByRole('button', { name: /preview/i }),
            ).toBeInTheDocument()
        })

        it('should show play icon when paused', () => {
            renderComponent(mockValue)

            const button = screen.getByRole('button', { name: /preview/i })
            const icon = button.querySelector('.material-icons')

            expect(icon).toHaveTextContent('play_arrow')
        })
    })

    describe('generating preview', () => {
        it('should generate preview when clicking play with no existing audio', async () => {
            renderComponent(mockValue)

            const button = screen.getByRole('button', { name: /preview/i })

            await act(async () => {
                await userEvent.click(button)
            })

            await waitFor(() => {
                expect(screen.getByText('Loading')).toBeInTheDocument()
            })
        })

        it('should disable button while generating', async () => {
            renderComponent(mockValue)

            const button = screen.getByRole('button', { name: /preview/i })

            await act(async () => {
                await userEvent.click(button)
            })

            await waitFor(() => {
                expect(button).toBeDisabled()
            })
        })

        it('should disable button for no text content', async () => {
            renderComponent({ ...mockValue, text_to_speech_content: '' })

            const button = screen.getByRole('button', { name: /preview/i })

            await waitFor(() => {
                expect(button).toBeDisabled()
            })
        })

        it('should handle generation errors gracefully', async () => {
            const errorHandler = mockSynthesizeSpeechPreviewHandler(async () =>
                HttpResponse.json(null, {
                    status: 500,
                }),
            )
            server.use(errorHandler.handler)

            renderComponent(mockValue)

            const button = screen.getByRole('button', { name: /preview/i })

            await act(async () => {
                await userEvent.click(button)
            })

            // Button should no longer be generating after error
            await waitFor(() => {
                expect(mockNotify.error).toHaveBeenCalledWith(
                    'Failed to generate voice preview.',
                )
                expect(button).not.toBeDisabled()
            })
        })

        it('should show downloading icon when generating', async () => {
            renderComponent(mockValue)

            const button = screen.getByRole('button', { name: /preview/i })
            const icon = button.querySelector('.material-icons')

            // Initially should show play icon
            expect(icon).toHaveTextContent('play_arrow')

            // Click to start generation
            await act(async () => {
                await userEvent.click(button)
            })

            // Should show loading while generating
            await waitFor(() => {
                expect(screen.getByText('Loading')).toBeInTheDocument()
            })

            // Button should be disabled while generating
            expect(button).toBeDisabled()
        })
    })

    describe('playing and pausing audio', () => {
        beforeEach(() => {
            // Mock HTMLAudioElement methods and properties
            HTMLAudioElement.prototype.play = jest
                .fn()
                .mockResolvedValue(undefined)
            HTMLAudioElement.prototype.pause = jest.fn()
            Object.defineProperty(HTMLAudioElement.prototype, 'paused', {
                get: jest.fn().mockReturnValue(true),
                configurable: true,
            })
        })

        it('should play audio when clicking button with existing file', async () => {
            renderComponent(mockValueWithFile)

            const button = screen.getByRole('button', { name: /preview/i })
            const audio = document.querySelector('audio')

            await act(async () => {
                await userEvent.click(button)
            })

            expect(audio?.play).toHaveBeenCalled()
        })

        it('should call pause when clicking button while audio is playing', async () => {
            // Mock paused property to return false (audio is playing)
            Object.defineProperty(HTMLAudioElement.prototype, 'paused', {
                get: jest.fn().mockReturnValue(false),
                configurable: true,
            })

            renderComponent(mockValueWithFile)

            const button = screen.getByRole('button', { name: /preview/i })
            const audio = document.querySelector('audio')

            // Click while audio is "playing" (paused = false)
            await act(async () => {
                await userEvent.click(button)
            })

            waitFor(() => expect(audio?.pause).toHaveBeenCalled())
        })

        it('should update icon to pause when audio is playing', async () => {
            renderComponent(mockValueWithFile)

            const button = screen.getByRole('button', { name: /preview/i })
            const audio = document.querySelector('audio')

            await act(async () => {
                await userEvent.click(button)
            })

            // Simulate audio playing
            await act(async () => {
                audio?.dispatchEvent(new Event('play'))
            })

            await waitFor(() => {
                const icon = button.querySelector('.material-icons')
                expect(icon).toHaveTextContent('pause')
            })
        })

        it('should update button when audio is paused', async () => {
            renderComponent(mockValueWithFile)

            const button = screen.getByRole('button', { name: /preview/i })
            const audio = document.querySelector('audio')

            // Start playing
            await act(async () => {
                await userEvent.click(button)
            })

            waitFor(() => {
                expect(audio?.play).toHaveBeenCalled()
                expect(
                    screen.getByRole('button', { name: /pause/i }),
                ).toBeInTheDocument()
            })

            // Pause
            await act(async () => {
                await userEvent.click(button)
            })

            await waitFor(() => {
                expect(audio?.pause).toHaveBeenCalled()
                expect(
                    screen.getByRole('button', { name: /resume/i }),
                ).toBeInTheDocument()
            })
        })
    })

    describe('audio element', () => {
        it('should render audio element with correct src', () => {
            renderComponent(mockValueWithFile)

            const audio = document.querySelector('audio')
            expect(audio).toBeInTheDocument()
            expect(audio).toHaveAttribute(
                'src',
                'https://example.com/audio.mp3',
            )
            expect(audio).toHaveAttribute('hidden')
        })

        it('should render audio element with empty src when no file path', () => {
            renderComponent(mockValue)

            const audio = document.querySelector('audio')
            expect(audio).toBeInTheDocument()
            expect(audio).toHaveAttribute('src', '')
        })
    })

    describe('API request', () => {
        it('should send correct data to synthesize API', async () => {
            const waitForRequest =
                mockSynthesizeSpeechPreviewHandler().waitForRequest(server)

            renderComponent(mockValue)

            const button = screen.getByRole('button', { name: /preview/i })

            await act(async () => {
                await userEvent.click(button)
            })

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toEqual({
                    language_code: VoiceLanguage.EnUs,
                    voice_gender: VoiceGender.Female,
                    property_url: 'testing',
                    text: 'Hello, this is a test message',
                })
            })
        })

        it('should use default language and gender when language and gender are not provided', async () => {
            const waitForRequest =
                mockSynthesizeSpeechPreviewHandler().waitForRequest(server)

            const valueWithoutLanguage = {
                ...mockValue,
                language: undefined,
                gender: undefined,
            } as VoiceMessageTextToSpeech

            renderComponent(valueWithoutLanguage)

            const button = screen.getByRole('button', { name: /preview/i })

            await act(async () => {
                await userEvent.click(button)
            })

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body.language_code).toBe(VoiceLanguage.EnUs)
                expect(body.voice_gender).toBe(VoiceGender.Female)
            })
        })
    })
})
