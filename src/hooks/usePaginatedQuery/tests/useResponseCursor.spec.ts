import {renderHook} from '@testing-library/react-hooks'

import {AxiosResponse} from 'axios'

import {ApiListResponseCursorPagination} from 'models/api/types'

import {useResponseCursor} from '../useResponseCursor'

describe('useSearchParams hook', () => {
    it('should return previous and next cursor', () => {
        const previousCursor = '20-1rpz-magle'
        const nextCursor = '21-2rpz-magle'
        const hook = renderHook(() =>
            useResponseCursor({
                data: {
                    data: {
                        meta: {
                            prev_cursor: previousCursor,
                            next_cursor: nextCursor,
                        },
                    },
                } as unknown as AxiosResponse<
                    ApiListResponseCursorPagination<unknown>
                >,
                error: undefined,
            })
        )

        expect(hook.result.current.previousCursor).toBe(previousCursor)
        expect(hook.result.current.nextCursor).toBe(nextCursor)
        expect(hook.result.current.isCursorInvalid).toBe(false)
    })

    it("should return isCursorInvalid as true if error's cursor is invalid", () => {
        const hook = renderHook(() =>
            useResponseCursor({
                data: undefined,
                error: {
                    isAxiosError: true,
                    response: {
                        data: {
                            error: {
                                msg: 'Invalid cursor',
                                data: {
                                    cursor: ['Invalid cursor'],
                                },
                            },
                        },
                    },
                },
            })
        )

        expect(hook.result.current.nextCursor).toBe('')
        expect(hook.result.current.previousCursor).toBe('')
        expect(hook.result.current.isCursorInvalid).toBe(true)
    })

    it('should return isCursorInvalid as false on session expired error', () => {
        const hook = renderHook(() =>
            useResponseCursor({
                data: undefined,
                error: {
                    isAxiosError: true,
                    response: {
                        data: {
                            error: {
                                msg: 'Unauthorized',
                            },
                        },
                    },
                },
            })
        )

        expect(hook.result.current.nextCursor).toBe('')
        expect(hook.result.current.previousCursor).toBe('')
        expect(hook.result.current.isCursorInvalid).toBe(false)
    })
})
