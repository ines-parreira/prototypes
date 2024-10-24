import client from 'models/api/resources'

import {sendSupportTicket, Props} from '../sendSupportTicket'

jest.mock('models/api/resources', () => ({
    get: jest.fn(),
}))

describe('sendSupportTicket', () => {
    it('should call client.get with the correct URL', async () => {
        const props: Props = {
            zapierHook: 'https://example.com/zapierHook',
            subject: 'Test Subject',
            message: 'Test Message',
            from: 'test@example.com',
            to: 'support@example.com',
            helpdeskPlan: 'acme',
            freeTrial: false,
            account: 'acme',
        }

        await sendSupportTicket(props)

        expect(client.get).toHaveBeenCalledTimes(1)
        expect(client.get).toHaveBeenCalledWith(
            'https://example.com/zapierHook?message=Test%20Message&from=test%40example.com&to=support%40example.com&subject=Test%20Subject&helpdeskPlan=acme&freeTrial=false&account=acme',
            {
                transformRequest: expect.any(Function),
            }
        )
    })
})
