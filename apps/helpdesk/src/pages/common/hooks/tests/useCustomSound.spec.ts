import { act, renderHook, waitFor } from '@testing-library/react'

import { useCustomSound } from '../useCustomSound'

describe('useCustomSound', () => {
    let audioContextMock: Partial<AudioContext>
    let gainNodeMock: Partial<GainNode>
    let bufferSourceMock: Partial<AudioBufferSourceNode>
    let decodeAudioDataMock: jest.Mock
    let fetchMock: jest.Mock
    let consoleWarnSpy: jest.SpyInstance
    let consoleErrorSpy: jest.SpyInstance

    beforeEach(() => {
        fetchMock = jest.fn()
        global.fetch = fetchMock as typeof fetch
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

        bufferSourceMock = {
            buffer: null,
            start: jest.fn(),
            connect: jest.fn(),
        }

        gainNodeMock = {
            gain: { value: 0 } as AudioParam,
            connect: jest.fn(),
        }

        decodeAudioDataMock = jest.fn()

        audioContextMock = {
            createGain: jest.fn(() => gainNodeMock as GainNode),
            createBufferSource: jest.fn(
                () => bufferSourceMock as AudioBufferSourceNode,
            ),
            decodeAudioData: decodeAudioDataMock,
            destination: {} as AudioDestinationNode,
            close: jest.fn().mockResolvedValue(undefined),
        }

        global.AudioContext = jest.fn(() => audioContextMock as AudioContext)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should initialize AudioContext and gain node on mount, then clone on unmount', async () => {
        const { unmount } = renderHook(() => useCustomSound('sound.mp3'))

        expect(AudioContext).toHaveBeenCalled()
        expect(audioContextMock.createGain).toHaveBeenCalled()
        expect(gainNodeMock.connect).toHaveBeenCalledWith(
            audioContextMock.destination,
        )

        unmount()

        await waitFor(() => {
            expect(audioContextMock.close).toHaveBeenCalled()
        })
    })

    it('should fetch and decode sound file', async () => {
        const arrayBufferMock = new ArrayBuffer(8)
        const audioBufferMock = {} as AudioBuffer
        fetchMock.mockResolvedValue({
            arrayBuffer: jest.fn().mockResolvedValue(arrayBufferMock),
        })
        decodeAudioDataMock.mockResolvedValue(audioBufferMock)

        renderHook(() => useCustomSound('sound.mp3'))

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith('sound.mp3')
            expect(decodeAudioDataMock).toHaveBeenCalledWith(arrayBufferMock)
        })
    })

    describe('playSound', () => {
        it('should play sound with correct volume', async () => {
            const arrayBufferMock = new ArrayBuffer(8)
            const mockAudioBuffer = {} as AudioBuffer
            fetchMock.mockResolvedValue({
                arrayBuffer: jest.fn().mockResolvedValue(arrayBufferMock),
            })
            decodeAudioDataMock.mockResolvedValue(mockAudioBuffer)

            const { result } = renderHook(() => useCustomSound('sound.mp3', 7))

            await waitFor(() => {
                expect(decodeAudioDataMock).toHaveBeenCalled()
            })

            act(() => {
                result.current.playSound()
            })

            expect(audioContextMock.createBufferSource).toHaveBeenCalled()
            expect(bufferSourceMock.buffer).toBe(mockAudioBuffer)
            expect(gainNodeMock.gain?.value).toBe(0.7)
            expect(bufferSourceMock.connect).toHaveBeenCalledWith(gainNodeMock)
            expect(bufferSourceMock.start).toHaveBeenCalledWith(0)
        })

        it('should warn if buffer is not loaded yet', () => {
            fetchMock.mockImplementation(() => new Promise(() => {}))

            const { result } = renderHook(() => useCustomSound('sound.mp3'))

            act(() => {
                result.current.playSound()
            })

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                'Sound buffer not loaded yet',
            )
            expect(audioContextMock.createBufferSource).not.toHaveBeenCalled()
        })
    })

    describe('load errors', () => {
        it('should handle fetch errors gracefully', async () => {
            const error = new Error('Network error')
            fetchMock.mockRejectedValue(error)

            renderHook(() => useCustomSound('sound.mp3'))

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Failed to load custom sound:',
                    error,
                )
            })
        })

        it('should handle decode errors gracefully', async () => {
            const mockArrayBuffer = new ArrayBuffer(8)
            const error = new Error('Decode error')
            fetchMock.mockResolvedValue({
                arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
            })
            decodeAudioDataMock.mockRejectedValue(error)

            renderHook(() => useCustomSound('sound.mp3'))

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Failed to load custom sound:',
                    error,
                )
            })
        })
    })
})
