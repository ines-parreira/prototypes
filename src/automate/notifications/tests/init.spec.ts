import { registerCategory, registerNotification } from 'common/notifications'

import { AI_AGENT_SET_AND_OPTIMIZED_TYPE } from '../constants'

jest.mock('common/notifications', () => ({
    registerCategory: jest.fn(),
    registerNotification: jest.fn(),
}))

describe('init', () => {
    it('should register categories and notifications', () => {
        require('../init')

        const categoryType = 'account-and-system-updates'
        expect(registerCategory).toHaveBeenCalledWith(
            expect.objectContaining({ type: categoryType }),
        )

        const notificationType = AI_AGENT_SET_AND_OPTIMIZED_TYPE
        expect(registerNotification).toHaveBeenCalledWith(
            expect.objectContaining({ type: notificationType }),
        )
    })
})
