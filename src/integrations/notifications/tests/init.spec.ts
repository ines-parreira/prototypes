import {registerNotification} from 'common/notifications'

jest.mock('common/notifications', () => ({
    registerNotification: jest.fn(),
}))

describe('init', () => {
    it('should register notifications', () => {
        require('../init')

        expect(registerNotification).toHaveBeenCalledWith(
            expect.objectContaining({type: 'email-domain.verified'})
        )
    })
})
