import {act, renderHook} from '@testing-library/react-hooks'

import {getNotificationSettings} from 'state/currentUser/selectors'

import type {Notification} from '../../types'
import useNotifications from '../useNotifications'
import useToasts from '../useToasts'

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

jest.mock('state/currentUser/selectors', () => ({
    getNotificationSettings: jest.fn(),
}))
const getNotificationSettingsMock =
    getNotificationSettings as unknown as jest.Mock

jest.mock('../useNotifications', () => jest.fn())
const useNotificationsMock = useNotifications as jest.Mock

describe('useToasts', () => {
    beforeEach(() => {
        getNotificationSettingsMock.mockReturnValue({
            data: {
                events: {},
                notification_sound: {
                    volume: 5,
                },
            },
        })
        useNotificationsMock.mockReset()
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should return no notifications by default', () => {
        const {result} = renderHook(() => useToasts())

        expect(result.current).toEqual({
            dismiss: expect.any(Function),
            notifications: [],
        })
    })

    it('should return notifications when they come in', () => {
        const {result} = renderHook(() => useToasts())

        const [[listener]] = useNotificationsMock.mock.calls as [
            (n: Notification) => void,
        ][]

        act(() => {
            listener({id: '1'} as unknown as Notification)
        })
        expect(result.current).toEqual({
            dismiss: expect.any(Function),
            notifications: [{id: '1'}],
        })
    })

    it('should automatically dismiss notifications after 5 seconds', () => {
        const {result} = renderHook(() => useToasts())

        const [[listener]] = useNotificationsMock.mock.calls as [
            (n: Notification) => void,
        ][]

        act(() => {
            listener({id: '1'} as unknown as Notification)
        })
        jest.advanceTimersByTime(4999)
        expect(result.current).toEqual({
            dismiss: expect.any(Function),
            notifications: [{id: '1'}],
        })

        act(() => {
            jest.advanceTimersByTime(1)
        })
        expect(result.current).toEqual({
            dismiss: expect.any(Function),
            notifications: [],
        })
    })

    it('should manually dismiss a notification', () => {
        const {result} = renderHook(() => useToasts())

        const [[listener]] = useNotificationsMock.mock.calls as [
            (n: Notification) => void,
        ][]

        act(() => {
            listener({id: '1'} as unknown as Notification)
        })
        act(() => {
            result.current.dismiss('1')
        })
        expect(result.current).toEqual({
            dismiss: expect.any(Function),
            notifications: [],
        })
    })
})
