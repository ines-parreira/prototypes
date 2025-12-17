import { useFlag } from '@repo/feature-flags'
import { act, renderHook } from '@repo/testing'

import { requestNotificationPermission } from '../../requestNotificationPermission'
import useNotificationsContext from '../useNotificationsContext'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const useFlagMock = useFlag as jest.Mock

jest.mock('../../requestNotificationPermission', () => ({
    requestNotificationPermission: jest.fn(),
}))

describe('useNotificationsContext', () => {
    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
    })

    it('should return the default state', () => {
        const { result } = renderHook(() => useNotificationsContext())
        expect(result.current).toEqual([false, expect.any(Function)])
    })

    it('should not request permission and only toggle the state', () => {
        const { result } = renderHook(() => useNotificationsContext())
        act(() => {
            result.current[1]()
        })

        expect(requestNotificationPermission).not.toHaveBeenCalled()
        expect(result.current[0]).toBe(true)
    })

    it('should request permission and toggle the state', () => {
        useFlagMock.mockReturnValue(true)
        const { result } = renderHook(() => useNotificationsContext())
        act(() => {
            result.current[1]()
        })

        expect(requestNotificationPermission).toHaveBeenCalled()
        expect(result.current[0]).toBe(true)
    })
})
