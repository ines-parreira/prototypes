import { renderHook } from '@repo/testing'

import {
    hasBlockingUnsavedWork,
    useCopilotNavigationGuard,
} from './unsavedWorkGuard'

describe('unsavedWorkGuard', () => {
    it('reports no blocking work by default', () => {
        expect(hasBlockingUnsavedWork()).toBe(false)
    })

    it('blocks while a mounted source is dirty', () => {
        renderHook(() => useCopilotNavigationGuard(true))

        expect(hasBlockingUnsavedWork()).toBe(true)
    })

    it('does not block when a mounted source is clean', () => {
        renderHook(() => useCopilotNavigationGuard(false))

        expect(hasBlockingUnsavedWork()).toBe(false)
    })

    it('clears the block when the source flips from dirty to clean', () => {
        const { rerender } = renderHook(
            ({ isDirty }) => useCopilotNavigationGuard(isDirty),
            { initialProps: { isDirty: true } },
        )
        expect(hasBlockingUnsavedWork()).toBe(true)

        rerender({ isDirty: false })

        expect(hasBlockingUnsavedWork()).toBe(false)
    })

    it('clears the block when a dirty source unmounts', () => {
        const { unmount } = renderHook(() => useCopilotNavigationGuard(true))
        expect(hasBlockingUnsavedWork()).toBe(true)

        unmount()

        expect(hasBlockingUnsavedWork()).toBe(false)
    })

    it('stays blocked until every concurrent dirty source clears', () => {
        const first = renderHook(
            ({ isDirty }) => useCopilotNavigationGuard(isDirty),
            { initialProps: { isDirty: true } },
        )
        const second = renderHook(
            ({ isDirty }) => useCopilotNavigationGuard(isDirty),
            { initialProps: { isDirty: true } },
        )
        expect(hasBlockingUnsavedWork()).toBe(true)

        first.rerender({ isDirty: false })
        expect(hasBlockingUnsavedWork()).toBe(true)

        second.rerender({ isDirty: false })
        expect(hasBlockingUnsavedWork()).toBe(false)
    })

    it('does not leak tokens across mounts', () => {
        const guards = Array.from({ length: 5 }, () =>
            renderHook(() => useCopilotNavigationGuard(true)),
        )
        expect(hasBlockingUnsavedWork()).toBe(true)

        guards.forEach((guard) => {
            guard.unmount()
        })

        expect(hasBlockingUnsavedWork()).toBe(false)
    })
})
