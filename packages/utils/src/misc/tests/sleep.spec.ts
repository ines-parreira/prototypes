import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { sleep } from '../sleep'

describe('sleep', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should return a promise that resolves after specified milliseconds', async () => {
        const promise = sleep(1000)

        expect(promise).toBeInstanceOf(Promise)

        vi.advanceTimersByTime(1000)
        const result = await promise

        expect(result).toBeUndefined()
    })

    it('should handle zero milliseconds', async () => {
        const promise = sleep(0)
        vi.advanceTimersByTime(0)
        await promise

        expect(vi.getTimerCount()).toBe(0)
    })

    it('should handle multiple concurrent sleeps', async () => {
        const sleep1 = sleep(100)
        const sleep2 = sleep(200)

        vi.advanceTimersByTime(100)
        await sleep1
        expect(vi.getTimerCount()).toBe(1)

        vi.advanceTimersByTime(100)
        await sleep2
        expect(vi.getTimerCount()).toBe(0)
    })

    it('should work in async/await context', async () => {
        const executionOrder: string[] = []

        const testAsync = async () => {
            executionOrder.push('start')
            await sleep(100)
            executionOrder.push('after sleep')
            return 'done'
        }

        const promise = testAsync()
        expect(executionOrder).toEqual(['start'])

        vi.advanceTimersByTime(100)
        const result = await promise

        expect(executionOrder).toEqual(['start', 'after sleep'])
        expect(result).toBe('done')
    })
})
