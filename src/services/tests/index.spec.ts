import { notificationSounds } from '..'
import NotificationSounds from '../NotificationSounds'

jest.mock('../NotificationSounds')

describe('services', () => {
    it('should export an instance of the NotificationSounds service', () => {
        expect(notificationSounds).toBeInstanceOf(NotificationSounds)
    })
})
