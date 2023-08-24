import NotificationSounds from '../NotificationSounds'

import {notificationSounds} from '..'

jest.mock('../NotificationSounds')

describe('services', () => {
    it('should export an instance of the NotificationSounds service', () => {
        expect(notificationSounds).toBeInstanceOf(NotificationSounds)
    })
})
