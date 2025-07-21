import { registerNotifications } from '../notifications'

describe('registerNotifictions', () => {
    let addEventListener: jest.SpyInstance

    beforeEach(() => {
        addEventListener = jest.spyOn(self, 'addEventListener')
    })

    it('should register a message handler', () => {
        registerNotifications()
        expect(addEventListener).toHaveBeenCalledWith(
            'message',
            expect.any(Function),
        )
    })
})
