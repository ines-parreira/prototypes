import type { ChangeEvent } from 'react'

import { act } from '@testing-library/react'
import { vi } from 'vitest'

import { request } from '@gorgias/helpdesk-client'

import { renderHook } from '../../../tests/render.utils'
import { useAudioPlayer } from '../hooks/useAudioPlayer'

vi.mock('@gorgias/helpdesk-client', () => ({
    request: vi.fn(),
}))

beforeAll(() => {
    window.HTMLMediaElement.prototype.play = vi
        .fn()
        .mockResolvedValue(undefined)
    window.HTMLMediaElement.prototype.pause = vi.fn()
})

describe('useAudioPlayer', () => {
    it('returns the correct initial state', () => {
        const { result } = renderHook(() =>
            useAudioPlayer({ url: 'https://example.com/audio.mp3' }),
        )
        expect(result.current.isPlaying).toBe(false)
        expect(result.current.currentTime).toBe(0)
        expect(result.current.duration).toBe(0)
        expect(result.current.volume).toBe(1)
        expect(result.current.isMuted).toBe(false)
        expect(result.current.audioRef.current).toBeNull()
    })

    it('initialises duration from initialDuration prop', () => {
        const { result } = renderHook(() =>
            useAudioPlayer({
                url: 'https://example.com/audio.mp3',
                initialDuration: 90,
            }),
        )
        expect(result.current.duration).toBe(90)
    })

    it('handleMuteToggle toggles isMuted', () => {
        const { result } = renderHook(() =>
            useAudioPlayer({ url: 'https://example.com/audio.mp3' }),
        )
        act(() => {
            result.current.handleMuteToggle()
        })
        expect(result.current.isMuted).toBe(true)
        act(() => {
            result.current.handleMuteToggle()
        })
        expect(result.current.isMuted).toBe(false)
    })

    it('handleVolumeChange updates volume and clears isMuted', () => {
        const { result } = renderHook(() =>
            useAudioPlayer({ url: 'https://example.com/audio.mp3' }),
        )
        act(() => {
            result.current.handleMuteToggle()
        })
        expect(result.current.isMuted).toBe(true)
        act(() => {
            result.current.handleVolumeChange({
                target: { value: '0.5' },
            } as ChangeEvent<HTMLInputElement>)
        })
        expect(result.current.volume).toBe(0.5)
        expect(result.current.isMuted).toBe(false)
    })

    it('handleSeek updates currentTime', () => {
        const { result } = renderHook(() =>
            useAudioPlayer({ url: 'https://example.com/audio.mp3' }),
        )
        act(() => {
            result.current.handleSeek({
                target: { value: '42' },
            } as ChangeEvent<HTMLInputElement>)
        })
        expect(result.current.currentTime).toBe(42)
    })

    it('handlePlayPause returns early when audioRef.current is null', () => {
        const { result } = renderHook(() =>
            useAudioPlayer({ url: 'https://example.com/audio.mp3' }),
        )
        act(() => {
            result.current.handlePlayPause()
        })
        expect(result.current.isPlaying).toBe(false)
    })

    it('handlePlayPause calls play and sets isPlaying to true when not playing', async () => {
        const { result } = renderHook(() =>
            useAudioPlayer({ url: 'https://example.com/audio.mp3' }),
        )
        const mockPlay = vi.fn().mockResolvedValue(undefined)
        result.current.audioRef.current = {
            play: mockPlay,
            pause: vi.fn(),
        } as unknown as HTMLAudioElement

        await act(async () => {
            result.current.handlePlayPause()
        })

        expect(mockPlay).toHaveBeenCalled()
        expect(result.current.isPlaying).toBe(true)
    })

    it('handlePlayPause calls pause and sets isPlaying to false when playing', async () => {
        const { result } = renderHook(() =>
            useAudioPlayer({ url: 'https://example.com/audio.mp3' }),
        )
        const mockPause = vi.fn()
        result.current.audioRef.current = {
            play: vi.fn().mockResolvedValue(undefined),
            pause: mockPause,
        } as unknown as HTMLAudioElement

        await act(async () => {
            result.current.handlePlayPause()
        })
        expect(result.current.isPlaying).toBe(true)

        act(() => {
            result.current.handlePlayPause()
        })
        expect(mockPause).toHaveBeenCalled()
        expect(result.current.isPlaying).toBe(false)
    })

    it('handlePlayPause sets isPlaying to false when play() rejects', async () => {
        const { result } = renderHook(() =>
            useAudioPlayer({ url: 'https://example.com/audio.mp3' }),
        )
        result.current.audioRef.current = {
            play: vi.fn().mockRejectedValue(new Error('play failed')),
            pause: vi.fn(),
        } as unknown as HTMLAudioElement

        await act(async () => {
            result.current.handlePlayPause()
        })

        expect(result.current.isPlaying).toBe(false)
    })

    it('handleSeek sets currentTime on the audio element', () => {
        const { result } = renderHook(() =>
            useAudioPlayer({ url: 'https://example.com/audio.mp3' }),
        )
        const mockAudio = { currentTime: 0 } as unknown as HTMLAudioElement
        result.current.audioRef.current = mockAudio

        act(() => {
            result.current.handleSeek({
                target: { value: '30' },
            } as ChangeEvent<HTMLInputElement>)
        })

        expect(mockAudio.currentTime).toBe(30)
    })

    it('handleVolumeChange sets volume and muted=false on the audio element', () => {
        const { result } = renderHook(() =>
            useAudioPlayer({ url: 'https://example.com/audio.mp3' }),
        )
        const mockAudio = {
            volume: 1,
            muted: true,
        } as unknown as HTMLAudioElement
        result.current.audioRef.current = mockAudio

        act(() => {
            result.current.handleVolumeChange({
                target: { value: '0.5' },
            } as ChangeEvent<HTMLInputElement>)
        })

        expect(mockAudio.volume).toBe(0.5)
        expect(mockAudio.muted).toBe(false)
    })

    it('handleMuteToggle sets muted on the audio element', () => {
        const { result } = renderHook(() =>
            useAudioPlayer({ url: 'https://example.com/audio.mp3' }),
        )
        const mockAudio = { muted: false } as unknown as HTMLAudioElement
        result.current.audioRef.current = mockAudio

        act(() => {
            result.current.handleMuteToggle()
        })

        expect(mockAudio.muted).toBe(true)
    })

    it('handleDownload fetches the blob and triggers a download', async () => {
        const { result } = renderHook(() =>
            useAudioPlayer({ url: 'https://example.com/audio.mp3' }),
        )

        const fakeBlob = new Blob(['audio'], { type: 'audio/mpeg' })
        vi.mocked(request).mockResolvedValue({ data: fakeBlob } as never)

        const fakeBlobUrl = 'blob:fake-url'
        const createObjectURLSpy = vi
            .spyOn(window.URL, 'createObjectURL')
            .mockReturnValue(fakeBlobUrl)
        const revokeObjectURLSpy = vi
            .spyOn(window.URL, 'revokeObjectURL')
            .mockImplementation(vi.fn())

        const mockClick = vi.fn()
        const mockAnchor = {
            style: {},
            href: '',
            setAttribute: vi.fn(),
            click: mockClick,
        } as unknown as HTMLAnchorElement
        const createElementSpy = vi
            .spyOn(document, 'createElement')
            .mockReturnValue(mockAnchor)
        const appendChildSpy = vi
            .spyOn(document.body, 'appendChild')
            .mockImplementation(vi.fn())
        const removeChildSpy = vi
            .spyOn(document.body, 'removeChild')
            .mockImplementation(vi.fn())

        await act(async () => {
            await result.current.handleDownload()
        })

        expect(request).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'GET',
                url: 'https://example.com/audio.mp3',
                responseType: 'blob',
            }),
        )
        expect(createObjectURLSpy).toHaveBeenCalledWith(fakeBlob)
        expect(createElementSpy).toHaveBeenCalledWith('a')
        expect(mockAnchor.href).toBe(fakeBlobUrl)
        expect(mockAnchor.setAttribute).toHaveBeenCalledWith(
            'download',
            'recording.mp3',
        )
        expect(appendChildSpy).toHaveBeenCalledWith(mockAnchor)
        expect(mockClick).toHaveBeenCalled()
        expect(removeChildSpy).toHaveBeenCalledWith(mockAnchor)
        expect(revokeObjectURLSpy).toHaveBeenCalledWith(fakeBlobUrl)

        createElementSpy.mockRestore()
        createObjectURLSpy.mockRestore()
        revokeObjectURLSpy.mockRestore()
        appendChildSpy.mockRestore()
        removeChildSpy.mockRestore()
    })

    it('handleDownload does not throw when the request fails', async () => {
        const { result } = renderHook(() =>
            useAudioPlayer({ url: 'https://example.com/audio.mp3' }),
        )

        vi.mocked(request).mockRejectedValue(new Error('Network error'))

        await expect(
            act(async () => {
                await result.current.handleDownload()
            }),
        ).resolves.not.toThrow()
    })

    it('handleSpeedChange sets playbackRate on the audio element', () => {
        const { result } = renderHook(() =>
            useAudioPlayer({ url: 'https://example.com/audio.mp3' }),
        )
        const mockAudio = { playbackRate: 1 } as unknown as HTMLAudioElement
        result.current.audioRef.current = mockAudio

        act(() => {
            result.current.handleSpeedChange(1.5)
        })

        expect(mockAudio.playbackRate).toBe(1.5)
    })

    it('onTimeUpdate reads currentTime from the audio element', () => {
        const { result } = renderHook(() =>
            useAudioPlayer({ url: 'https://example.com/audio.mp3' }),
        )
        result.current.audioRef.current = {
            currentTime: 45,
        } as unknown as HTMLAudioElement

        act(() => {
            result.current.onTimeUpdate()
        })

        expect(result.current.currentTime).toBe(45)
    })

    it('onLoadedMetadata reads duration from the audio element', () => {
        const { result } = renderHook(() =>
            useAudioPlayer({ url: 'https://example.com/audio.mp3' }),
        )
        result.current.audioRef.current = {
            duration: 120,
        } as unknown as HTMLAudioElement

        act(() => {
            result.current.onLoadedMetadata()
        })

        expect(result.current.duration).toBe(120)
    })

    it('onEnded sets isPlaying to false', async () => {
        const { result } = renderHook(() =>
            useAudioPlayer({ url: 'https://example.com/audio.mp3' }),
        )
        result.current.audioRef.current = {
            play: vi.fn().mockResolvedValue(undefined),
            pause: vi.fn(),
        } as unknown as HTMLAudioElement

        await act(async () => {
            result.current.handlePlayPause()
        })
        expect(result.current.isPlaying).toBe(true)

        act(() => {
            result.current.onEnded()
        })
        expect(result.current.isPlaying).toBe(false)
    })
})
