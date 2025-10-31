import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import TTSPreviewButton, { AudioState } from '../TTSPreviewButton'

// Mock the replaceAttachmentURL utility
jest.mock('utils', () => ({
    replaceAttachmentURL: (url: string) => url,
}))

describe('TTSPreviewButton', () => {
    const handleLoad = jest.fn()

    const renderComponent = (
        src: string,
        audioState: AudioState,
        setAudioState: (audioState: AudioState) => void,
        isDisabled = false,
    ) => {
        return render(
            <TTSPreviewButton
                src={src}
                onLoad={handleLoad}
                audioState={audioState}
                setAudioState={setAudioState}
                isDisabled={isDisabled}
            />,
        )
    }

    describe('rendering', () => {
        it('should render new state', () => {
            renderComponent('audio.mp3', AudioState.NEW, jest.fn())

            expect(
                screen.getByRole('button', { name: /preview/i }),
            ).toBeInTheDocument()
            expect(screen.getByText('play_arrow')).toBeInTheDocument()
        })

        it('should render playing state', () => {
            renderComponent('audio.mp3', AudioState.PLAYING, jest.fn())

            expect(
                screen.getByRole('button', { name: /Pause/i }),
            ).toBeInTheDocument()
            expect(screen.getByText('pause')).toBeInTheDocument()
        })

        it('should render paused state', () => {
            renderComponent('audio.mp3', AudioState.PAUSED, jest.fn())

            expect(
                screen.getByRole('button', { name: /Resume/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('img', { name: 'media-play-pause' }),
            ).toBeInTheDocument()
        })

        it('should render loading state', () => {
            renderComponent('audio.mp3', AudioState.LOADING, jest.fn())

            expect(
                screen.getByRole('button', { name: /Loading/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /Loading/i }),
            ).toBeDisabled()
        })

        it('should render disabled state', () => {
            renderComponent('audio.mp3', AudioState.NEW, jest.fn(), true)

            expect(
                screen.getByRole('button', { name: /Preview/i }),
            ).toBeDisabled()
        })
    })

    describe('button clicks', () => {
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
            const mockSetValue = jest.fn()
            const { rerender } = renderComponent(
                'audio.mp3',
                AudioState.NEW,
                mockSetValue,
            )

            const button = screen.getByRole('button', { name: /preview/i })
            const audio = document.querySelector('audio')

            await act(async () => {
                await userEvent.click(button)
            })

            expect(mockSetValue).toHaveBeenCalledWith(AudioState.PLAYING)

            // Rerender to simulate state change
            rerender(
                <TTSPreviewButton
                    src={'audio.mp3'}
                    onLoad={handleLoad}
                    audioState={AudioState.PLAYING}
                    setAudioState={mockSetValue}
                />,
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /Pause/i }),
                ).toBeInTheDocument()
                expect(audio?.play).toHaveBeenCalled()
            })
        })

        it('should load audio when clicking button with no file', async () => {
            renderComponent('', AudioState.NEW, jest.fn())

            await act(async () => {
                await userEvent.click(
                    screen.getByRole('button', { name: /preview/i }),
                )
            })

            await waitFor(() => {
                expect(handleLoad).toHaveBeenCalled()
            })
        })

        it('should pause audio when clicking button with existing file', async () => {
            const mockSetValue = jest.fn()
            const { rerender } = renderComponent(
                'audio.mp3',
                AudioState.PLAYING,
                mockSetValue,
            )

            const button = screen.getByRole('button', { name: /Pause/i })
            const audio = document.querySelector('audio')

            await act(async () => {
                await userEvent.click(button)
            })

            expect(mockSetValue).toHaveBeenCalledWith(AudioState.PAUSED)

            // Rerender to simulate state change
            rerender(
                <TTSPreviewButton
                    src={'audio.mp3'}
                    onLoad={handleLoad}
                    audioState={AudioState.PAUSED}
                    setAudioState={mockSetValue}
                />,
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /Resume/i }),
                ).toBeInTheDocument()
                expect(audio?.pause).toHaveBeenCalled()
            })
        })

        it('should resume audio when clicking button with existing file', async () => {
            const mockSetValue = jest.fn()
            const { rerender } = renderComponent(
                'audio.mp3',
                AudioState.PAUSED,
                mockSetValue,
            )

            const button = screen.getByRole('button', { name: /Resume/i })
            const audio = document.querySelector('audio')

            await act(async () => {
                await userEvent.click(button)
            })

            expect(mockSetValue).toHaveBeenCalledWith(AudioState.PLAYING)

            // Rerender to simulate state change
            rerender(
                <TTSPreviewButton
                    src={'audio.mp3'}
                    onLoad={handleLoad}
                    audioState={AudioState.PLAYING}
                    setAudioState={mockSetValue}
                />,
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /Pause/i }),
                ).toBeInTheDocument()
                expect(audio?.play).toHaveBeenCalled()
            })
        })
    })
})
