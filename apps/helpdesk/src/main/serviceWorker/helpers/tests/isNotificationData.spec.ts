import { isNotificationData } from '../isNotificationData'

describe('isNotificationData', () => {
    it('should return false if no data is given', () => {
        const result = isNotificationData(null)
        expect(result).toBe(false)
    })

    it('should return false if data is not an object', () => {
        const result = isNotificationData('something')
        expect(result).toBe(false)
    })

    it('should return false if data has no type', () => {
        const result = isNotificationData({})
        expect(result).toBe(false)
    })

    it('should return false if the type is not notification.create', () => {
        const result = isNotificationData({ type: 'unknown' })
        expect(result).toBe(false)
    })

    it('should return true if the type is notification.create', () => {
        const result = isNotificationData({ type: 'notification.create' })
        expect(result).toBe(true)
    })
})
