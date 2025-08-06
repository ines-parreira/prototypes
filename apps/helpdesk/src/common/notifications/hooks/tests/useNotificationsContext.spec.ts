import { act, renderHook } from '@repo/testing'

import { requestNotificationPermission } from '../../requestNotificationPermission'
import useNotificationsContext from '../useNotificationsContext'

jest.mock('../../requestNotificationPermission', () => ({
    requestNotificationPermission: jest.fn(),
}))

describe('useNotificationsContext', () => {
    it('should return the default state', () => {
        const { result } = renderHook(() => useNotificationsContext())
        expect(result.current).toEqual([false, expect.any(Function)])
    })

    it('should request permission and toggle the state', () => {
        const { result } = renderHook(() => useNotificationsContext())
        act(() => {
            result.current[1]()
        })

        expect(requestNotificationPermission).toHaveBeenCalled()
        expect(result.current[0]).toBe(true)
    })
})
