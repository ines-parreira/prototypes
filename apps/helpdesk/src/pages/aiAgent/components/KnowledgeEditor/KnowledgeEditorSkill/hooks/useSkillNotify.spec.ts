import { renderHook } from '@repo/testing'

import { toast } from '@gorgias/axiom'

import { useSkillNotify } from './useSkillNotify'

jest.mock('@gorgias/axiom', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}))

describe('useSkillNotify', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('calls toast.success with message', () => {
        const { result } = renderHook(() => useSkillNotify())

        result.current.success('Operation completed')

        expect(toast.success).toHaveBeenCalledWith('Operation completed', {
            caption: undefined,
        })
    })

    it('calls toast.success with message and caption', () => {
        const { result } = renderHook(() => useSkillNotify())

        result.current.success('Operation completed', 'Some details')

        expect(toast.success).toHaveBeenCalledWith('Operation completed', {
            caption: 'Some details',
        })
    })

    it('calls toast.error with message', () => {
        const { result } = renderHook(() => useSkillNotify())

        result.current.error('Something went wrong')

        expect(toast.error).toHaveBeenCalledWith('Something went wrong')
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
