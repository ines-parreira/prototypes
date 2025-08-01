import { assumeMock, renderHook } from '@repo/testing'

import useAppDispatch from 'hooks/useAppDispatch'
import { useNotify } from 'hooks/useNotify'
import { notify as notifyAction } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('state/notifications/actions')
const notifyActionMock = assumeMock(notifyAction)

const mockDispatch = jest.fn()

describe('useNotify', () => {
    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(mockDispatch)
        notifyActionMock.mockReturnValue(mockDispatch)
    })

    it('should create a notify function that dispatches notifications', () => {
        const { result } = renderHook(() => useNotify())

        void result.current.notify({
            status: NotificationStatus.Success,
            message: 'Test message',
        })

        expect(mockDispatch).toHaveBeenCalledTimes(1)
        expect(notifyActionMock).toHaveBeenCalledWith({
            status: NotificationStatus.Success,
            message: 'Test message',
        })
    })

    it('should provide success notification shorthand', () => {
        const { result } = renderHook(() => useNotify())

        void result.current.success('Success message')

        expect(mockDispatch).toHaveBeenCalledTimes(1)
        expect(notifyActionMock).toHaveBeenCalledWith({
            status: NotificationStatus.Success,
            message: 'Success message',
        })
    })

    it('should provide error notification shorthand', () => {
        const { result } = renderHook(() => useNotify())

        void result.current.error('Error message')

        expect(mockDispatch).toHaveBeenCalledTimes(1)
        expect(notifyActionMock).toHaveBeenCalledWith({
            status: NotificationStatus.Error,
            message: 'Error message',
        })
    })

    it('should provide info notification shorthand', () => {
        const { result } = renderHook(() => useNotify())

        void result.current.info('Info message')

        expect(mockDispatch).toHaveBeenCalledTimes(1)
        expect(notifyActionMock).toHaveBeenCalledWith({
            status: NotificationStatus.Info,
            message: 'Info message',
        })
    })

    it('should provide warning notification shorthand', () => {
        const { result } = renderHook(() => useNotify())

        void result.current.warning('Warning message')

        expect(mockDispatch).toHaveBeenCalledTimes(1)
        expect(notifyActionMock).toHaveBeenCalledWith({
            status: NotificationStatus.Warning,
            message: 'Warning message',
        })
    })
})
