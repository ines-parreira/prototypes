import client from 'models/api/resources'

import {sendRemoveNotificationZap, Props} from '../sendRemoveNotificationZap'

jest.mock('models/api/resources', () => ({
    get: jest.fn(),
}))

describe('sendRemoveNotificationZap', () => {
    it('should call client.get with the correct URL', async () => {
        const props: Props = {
            zapierHook: 'https://example.com/zapierHook',
            subject: 'Test Subject',
            message: 'Test Message',
            from: 'test@example.com',
            to: 'support@example.com',
            helpdeskPlan: 'pro',
            automationPlan: 'pro-automation',
            freeTrial: false,
            account: 'acme',
        }

        await sendRemoveNotificationZap(props)

        expect(client.get).toHaveBeenCalledTimes(1)
        expect(client.get).toHaveBeenCalledWith(
            'https://example.com/zapierHook?message=Test+Message&from=test%40example.com&to=support%40example.com&subject=Test+Subject&helpdeskPlan=pro%0A++++++++&automationPlan=pro-automation&freeTrial=false&account=acme',
            {
                transformRequest: expect.any(Function),
            }
        )
    })
})
