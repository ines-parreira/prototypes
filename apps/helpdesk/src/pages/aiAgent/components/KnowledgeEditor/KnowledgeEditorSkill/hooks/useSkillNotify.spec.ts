import { renderHook } from '@testing-library/react'
import { POSITIONS } from 'reapop'

import { NotificationStatus } from 'state/notifications/types'

import { useSkillNotify } from './useSkillNotify'

const mockDispatch = jest.fn()

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: () => mockDispatch,
}))

jest.mock('state/notifications/actions', () => ({
    notify: (payload: unknown) => payload,
}))

describe('useSkillNotify', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('dispatches a success notification with bottomRight position', () => {
        const { result } = renderHook(() => useSkillNotify())

        result.current.success('Operation completed')

        expect(mockDispatch).toHaveBeenCalledWith({
            message: 'Operation completed',
            status: NotificationStatus.Success,
            position: POSITIONS.bottomRight,
        })
    })

    it('dispatches an error notification with bottomRight position', () => {
        const { result } = renderHook(() => useSkillNotify())

        result.current.error('Something went wrong')

        expect(mockDispatch).toHaveBeenCalledWith({
            message: 'Something went wrong',
            status: NotificationStatus.Error,
            position: POSITIONS.bottomRight,
        })
    })

    it('returns stable references across renders', () => {
        const { result, rerender } = renderHook(() => useSkillNotify())

        const firstSuccess = result.current.success
        const firstError = result.current.error

        rerender()

        expect(result.current.success).toBe(firstSuccess)
        expect(result.current.error).toBe(firstError)
    })
})
