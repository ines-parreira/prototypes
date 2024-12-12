import {registerCategory, registerNotification} from 'common/notifications'

jest.mock('common/notifications', () => ({
    registerCategory: jest.fn(),
    registerNotification: jest.fn(),
}))

describe('init', () => {
    it('should register categories and notifications', () => {
        require('../init')

        const categoryType = 'account-and-system-updates'
        expect(registerCategory).toHaveBeenCalledWith(
            expect.objectContaining({type: categoryType})
        )

        const notificationType = 'automate-setup-and-optimization'
        expect(registerNotification).toHaveBeenCalledWith(
            expect.objectContaining({type: notificationType})
        )
    })
})
