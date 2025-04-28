import { renderHook } from 'utils/testing/renderHook'

import useTitle from '../useTitle'

describe('useTitle hook', () => {
    const defaultTitle = 'Gorgias'
    document.title = defaultTitle

    jest.useFakeTimers()

    it('should do nothing if passed an empty value', () => {
        renderHook(() => useTitle(undefined))
        expect(document.title).toEqual(defaultTitle)
    })

    it('should set the title then restore it if passed a valid string', () => {
        const result = renderHook(() => useTitle('test'))
        expect(document.title).toEqual('test')

        result.unmount()
        jest.runOnlyPendingTimers()
        expect(document.title).toEqual(defaultTitle)
    })

    it('should not fallback to default title when switching from one title to another', () => {
        jest.spyOn(global, 'clearTimeout')
        const { unmount } = renderHook(() => useTitle('test'))
        expect(document.title).toEqual('test')
        expect(global.clearTimeout).toHaveBeenCalledTimes(1)
        unmount()
        expect(document.title).not.toEqual(defaultTitle)
        renderHook(() => useTitle('test'))
        expect(document.title).toEqual('test')
        expect(global.clearTimeout).toHaveBeenCalledTimes(2)
        jest.runOnlyPendingTimers()
        expect(document.title).not.toEqual(defaultTitle)
    })
})
