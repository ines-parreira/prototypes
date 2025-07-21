import { isRecentLogin } from '../utils'

describe('isRecentLogin', () => {
    it('should return false when the login time is unknown', () => {
        window.AUTH_TIME = null
        expect(isRecentLogin()).toBe(false)
    })

    it('should return false for a login older than 10 minutes', () => {
        window.AUTH_TIME = Date.now() / 1000 - 24 * 60 * 60
        expect(isRecentLogin()).toBe(false)
    })

    it('should return true for a login less than 10 minutes ago', () => {
        window.AUTH_TIME = Date.now() / 1000
        expect(isRecentLogin()).toBe(true)
    })
})
