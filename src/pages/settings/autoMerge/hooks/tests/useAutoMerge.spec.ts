import {renderHook, act} from '@testing-library/react-hooks'

import useAutoMerge from 'pages/settings/autoMerge/hooks/useAutoMerge'

describe('useAutoMerge', () => {
    it('should return a default auto-merge setting when none is provided', () => {
        const {result} = renderHook(() => useAutoMerge())

        expect(result.current).toEqual({
            enabled: false,
            merging_window_days: 5,
            onChangeEnabled: expect.any(Function),
            onChangeMergingWindowDays: expect.any(Function),
        })
    })

    it('should return the given auto-merge setting when provided', () => {
        const {result} = renderHook(() =>
            useAutoMerge({
                enabled: true,
                merging_window_days: 7,
            })
        )

        expect(result.current).toEqual({
            enabled: true,
            merging_window_days: 7,
            onChangeEnabled: expect.any(Function),
            onChangeMergingWindowDays: expect.any(Function),
        })
    })

    it('should change enabled when the callback is invoked', () => {
        const {result} = renderHook(() => useAutoMerge())

        act(() => {
            result.current.onChangeEnabled(true)
        })

        expect(result.current.enabled).toEqual(true)
    })

    it('should change merging_window_days when callback is invoked', () => {
        const {result} = renderHook(() => useAutoMerge())

        act(() => {
            result.current.onChangeMergingWindowDays(13)
        })

        expect(result.current.merging_window_days).toEqual(13)
    })
})
