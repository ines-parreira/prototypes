import { isCallActive, registerCallStateCallback } from '../reloadCallGuard'

describe('reloadCallGuard', () => {
    describe('isCallActive', () => {
        it('should return false when no callback is registered', () => {
            expect(isCallActive()).toBe(false)
        })

        it('should return the callback result when registered', () => {
            const unregister = registerCallStateCallback(() => true)
            expect(isCallActive()).toBe(true)
            unregister()
        })

        it('should return false after unregistering callback', () => {
            const unregister = registerCallStateCallback(() => true)
            unregister()
            expect(isCallActive()).toBe(false)
        })
    })
})
