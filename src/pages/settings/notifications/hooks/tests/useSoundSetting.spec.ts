import {act, renderHook} from '@testing-library/react-hooks'

import useSoundSetting from '../useSoundSetting'

describe('useSoundSetting', () => {
    it('should return a default sound setting if none is provided', () => {
        const {result} = renderHook(() => useSoundSetting())

        expect(result.current).toEqual(
            expect.objectContaining({
                enabled: true,
                sound: 'default',
                volume: 5,
            })
        )
    })

    it('should return the given sound setting if provided', () => {
        const {result} = renderHook(() =>
            useSoundSetting({
                enabled: false,
                sound: 'intuition',
                volume: 8,
            })
        )

        expect(result.current).toEqual(
            expect.objectContaining({
                enabled: false,
                sound: 'intuition',
                volume: 8,
            })
        )
    })

    it('should adjust enabled when the callback is invoked', () => {
        const {result} = renderHook(() => useSoundSetting())

        act(() => {
            result.current.onChangeEnabled(false)
        })

        expect(result.current.enabled).toBe(false)
    })

    it('should adjust the sound when the callback is invoked', () => {
        const {result} = renderHook(() => useSoundSetting())

        act(() => {
            result.current.onChangeSound('intuition')
        })

        expect(result.current.sound).toBe('intuition')
    })

    it('should adjust the volume when the callback is invoked', () => {
        const {result} = renderHook(() => useSoundSetting())

        act(() => {
            result.current.onChangeVolume(7)
        })

        expect(result.current.volume).toBe(7)
    })
})
