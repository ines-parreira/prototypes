import PushJS from 'push.js'

import browserNotification from '../browserNotification.ts'

describe('services', () => {
    describe('browserNotification', () => {
        beforeEach(() => {
            jest.clearAllMocks()
            PushJS.clear()
            browserNotification.playSound.cancel()
        })

        describe('newMessage()', () => {
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
                        playSoundNotification: playSoundNotification,
                    })
                    expect(spy).toHaveBeenCalled()
                }
            )

            it('should require interaction', () => {
                browserNotification.newMessage({
                    requireInteraction: true,
                })

                expect(PushJS.getAll()).toMatchSnapshot()
            })

            it('should create a browser notification with default values (empty)', () => {
                const spy = jest.spyOn(
                    global.HTMLMediaElement.prototype,
                    'play'
                )
                browserNotification.newMessage()
                expect(PushJS.getAll()).toMatchSnapshot()
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
                    ticketId: null,
                })
                expect(PushJS.getAll()).toMatchSnapshot()
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
                expect(PushJS.getAll()).toMatchSnapshot()
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
                expect(PushJS.getAll()).toMatchSnapshot()
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
                expect(PushJS.getAll()).toMatchSnapshot()
                expect(spy).toHaveBeenCalled()
            })

            it('should not throw unhandled promise rejection when the audio playing fails', (done) => {
                const spy = jest.spyOn(
                    global.HTMLMediaElement.prototype,
                    'play'
                )

                spy.mockRejectedValueOnce()

                browserNotification.newMessage({
                    title: 'title',
                    body: 'body',
                    ticketId: 12,
                })

                setImmediate(() => {
                    expect(PushJS.getAll()).toMatchSnapshot()
                    done()
                })
                expect(spy).toHaveBeenCalled()
            })

            it('should display several notifications but play sound once', () => {
                const spy = jest.spyOn(
                    global.HTMLMediaElement.prototype,
                    'play'
                )

                browserNotification.newMessage({
                    title: 'title',
                    body: 'body',
                    ticketId: 12,
                })
                browserNotification.newMessage({
                    title: 'title',
                    body: 'body',
                    ticketId: 123,
                })

                expect(PushJS.getAll()).toMatchSnapshot()
                expect(spy).toHaveBeenCalledTimes(1)
            })
        })

        describe('newMessageThrottled()', () => {
            it('should display a single notification when called several times', () => {
                const spy = jest.spyOn(
                    global.HTMLMediaElement.prototype,
                    'play'
                )

                browserNotification.newMessageThrottled({
                    title: 'title',
                    body: 'body',
                    ticketId: 12,
                })
                browserNotification.newMessageThrottled({
                    title: 'title',
                    body: 'body',
                    ticketId: 123,
                })

                expect(PushJS.getAll()).toMatchSnapshot()
                expect(spy).toHaveBeenCalledTimes(1)
            })
        })
    })
})
