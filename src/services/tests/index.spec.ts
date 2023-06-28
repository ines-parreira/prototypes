import NotificationSounds from '../NotificationSounds'

import {notificationSounds} from '..'

jest.mock('../NotificationSounds', () => jest.fn())

describe('services', () => {
    it('should export an instance of the NotificationSounds service', () => {
        expect(NotificationSounds).toHaveBeenCalledWith()
        expect(notificationSounds).toBeInstanceOf(NotificationSounds)
    })
})
