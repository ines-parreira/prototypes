import PushJS from 'push.js'

import browserNotification from '../browserNotification'

const typedPushJS = PushJS as typeof PushJS & {getAll: () => any}

describe('services', () => {
    describe('browserNotification', () => {
        describe('newMessage()', () => {
            beforeEach(() => {
                PushJS.clear()
                browserNotification.newMessage.cancel()
            })

            it('should not play the sound notification', () => {
                const spy = jest.spyOn(
                    global.HTMLMediaElement.prototype,
                    'play'
                )
                browserNotification.newMessage({
                    title: 'title',
                    body: 'body',
                    ticketId: 12,
                    playSoundNotification: false,
                })
                expect(spy).toHaveBeenCalledTimes(0)
            })

            it.each([true, null, undefined])(
                'should play the sound notification',
                (playSoundNotification) => {
                    const spy = jest.spyOn(
                        global.HTMLMediaElement.prototype,
                        'play'
                    )
                    browserNotification.newMessage({
                        title: 'title',
                        body: 'body',
                        ticketId: 12,
                        playSoundNotification: playSoundNotification!,
                    })
                    expect(spy).toHaveBeenCalled()
                }
            )

            it('should create a browser notification with default values (empty)', () => {
                const spy = jest.spyOn(
                    global.HTMLMediaElement.prototype,
                    'play'
                )
                browserNotification.newMessage()
                expect(typedPushJS.getAll()).toMatchSnapshot()
                expect(spy).toHaveBeenCalled()
            })

            it('should create a browser notification with default values (null values)', () => {
                const spy = jest.spyOn(
                    global.HTMLMediaElement.prototype,
                    'play'
                )
                browserNotification.newMessage({
                    title: null,
                    body: null,
                    ticketId: undefined,
                })
                expect(typedPushJS.getAll()).toMatchSnapshot()
                expect(spy).toHaveBeenCalled()
            })

            it('should create a browser notification with default values (empty values)', () => {
                const spy = jest.spyOn(
                    global.HTMLMediaElement.prototype,
                    'play'
                )
                browserNotification.newMessage({
                    title: '',
                    body: '',
                })
                expect(typedPushJS.getAll()).toMatchSnapshot()
                expect(spy).toHaveBeenCalled()
            })

            it('should create a browser notification with default values (invalid values)', () => {
                const spy = jest.spyOn(
                    global.HTMLMediaElement.prototype,
                    'play'
                )
                browserNotification.newMessage({
                    title: 1234,
                    body: 1234,
                })
                expect(typedPushJS.getAll()).toMatchSnapshot()
                expect(spy).toHaveBeenCalled()
            })

            it('should create a browser notification', () => {
                const spy = jest.spyOn(
                    global.HTMLMediaElement.prototype,
                    'play'
                )
                browserNotification.newMessage({
                    title: 'title',
                    body: 'body',
                    ticketId: 12,
                })
                expect(typedPushJS.getAll()).toMatchSnapshot()
                expect(spy).toHaveBeenCalled()
            })

            it('should not throw unhandled promise rejection when the audio playing fails', (done) => {
                const spy = jest.spyOn(
                    global.HTMLMediaElement.prototype,
                    'play'
                )

                spy.mockRejectedValueOnce(undefined)

                browserNotification.newMessage({
                    title: 'title',
                    body: 'body',
                    ticketId: 12,
                })

                setImmediate(() => {
                    expect(typedPushJS.getAll()).toMatchSnapshot()
                    done()
                })
                expect(spy).toHaveBeenCalled()
            })
        })
    })
})
