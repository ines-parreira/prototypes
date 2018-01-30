import browserNotification from '../browserNotification'
import PushJS from 'push.js'

describe('services', () => {
    describe('browserNotification', () => {
        describe('newMessage()', () => {
            it('should create a browser notification', () => {
                browserNotification.newMessage({
                    title: 'title',
                    body: 'body',
                    ticketId: 12
                })
                expect(PushJS.getAll()).toMatchSnapshot()
                PushJS.clear()
            })
        })
    })
})
