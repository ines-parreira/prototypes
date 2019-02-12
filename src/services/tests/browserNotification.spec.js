import PushJS from 'push.js'

import browserNotification from '../browserNotification'

describe('services', () => {
    describe('browserNotification', () => {
        describe('newMessage()', () => {
            beforeEach(() => {
                PushJS.clear()
                browserNotification.newMessage.cancel()
            })

            it('should create a browser notification with default values (empty)', () => {
                browserNotification.newMessage()
                expect(PushJS.getAll()).toMatchSnapshot()
            })

            it('should create a browser notification with default values (null values)', () => {
                browserNotification.newMessage({
                    title: null,
                    body: null,
                    ticketId: null
                })
                expect(PushJS.getAll()).toMatchSnapshot()
            })

            it('should create a browser notification with default values (invalid values)', () => {
                browserNotification.newMessage({
                    title: 1234,
                    body: 1234
                })
                expect(PushJS.getAll()).toMatchSnapshot()
            })

            it('should create a browser notification', () => {
                browserNotification.newMessage({
                    title: 'title',
                    body: 'body',
                    ticketId: 12
                })
                expect(PushJS.getAll()).toMatchSnapshot()
            })
        })
    })
})
