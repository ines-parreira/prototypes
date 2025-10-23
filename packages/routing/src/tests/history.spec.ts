import { describe, expect, it } from 'vitest'

import { history } from '../history'

describe('history', () => {
    it('should create a browser history instance', () => {
        expect(history).toBeDefined()
        expect(history.location).toBeDefined()
        expect(typeof history.push).toBe('function')
        expect(typeof history.replace).toBe('function')
        expect(typeof history.go).toBe('function')
    })
})
