import { registerNotifications } from '../notifications'

jest.mock('../notifications', () => ({
    registerNotifications: jest.fn(),
}))

describe('index', () => {
    it('should register notifications', () => {
        require('..')
        expect(registerNotifications).toHaveBeenCalledWith()
    })
})
