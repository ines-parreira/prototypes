import {fromJS} from 'immutable'

import {Ticket} from 'models/ticket/types'
import browserNotification from 'services/browserNotification'
import {getLDClient} from 'utils/launchDarkly'
import * as utils from 'utils'

import notifyOnNewMessage from '../notifyOnNewMessage'

jest.mock('utils/launchDarkly')
const variationMock = getLDClient().variation as jest.Mock

describe('notifyOnNewMessage', () => {
    const mockMessage = {
        id: 1,
        body_text: 'hello',
        body_html: '<div>hello</div>',
        channel: 'email',
    }
    const mockTicket = {
        id: 1,
        subject: 'title',
        messages: [mockMessage],
        customer: {
            id: 1,
            data: {hello: 'world!'},
        },
    } as unknown as Ticket

    const mockTicket2 = {
        ...mockTicket,
        messages: [mockMessage, mockMessage],
    }

    it('should notify if FF is disabled and tab is not active', async () => {
        const isTabActiveSpy = jest.spyOn(utils, 'isTabActive')
        isTabActiveSpy.mockReturnValue(false)
        variationMock.mockImplementation(() => false)
        const browserNotificationSpy = jest.spyOn(
            browserNotification,
            'newMessage'
        )

        await notifyOnNewMessage(fromJS(mockTicket), fromJS(mockTicket2))

        expect(browserNotificationSpy).toHaveBeenCalled()
    })

    it('should not notify if FF is disabled and tab is active', async () => {
        const isTabActiveSpy = jest.spyOn(utils, 'isTabActive')
        isTabActiveSpy.mockReturnValue(true)
        variationMock.mockImplementation(() => false)
        const browserNotificationSpy = jest.spyOn(
            browserNotification,
            'newMessage'
        )

        await notifyOnNewMessage(fromJS(mockTicket), fromJS(mockTicket2))

        expect(browserNotificationSpy).not.toHaveBeenCalled()
    })

    it('should not notify if FF is enabled', async () => {
        const isTabActiveSpy = jest.spyOn(utils, 'isTabActive')
        isTabActiveSpy.mockReturnValue(false)
        variationMock.mockImplementation(() => true)
        const browserNotificationSpy = jest.spyOn(
            browserNotification,
            'newMessage'
        )

        await notifyOnNewMessage(fromJS(mockTicket), fromJS(mockTicket2))

        expect(browserNotificationSpy).not.toHaveBeenCalled()
    })
})
