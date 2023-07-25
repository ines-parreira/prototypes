import PushJS from 'push.js'

import {notificationSounds} from 'services'
import {getNotificationSettings} from 'state/currentUser/selectors'

import {BrowserNotification} from '../browserNotification'

jest.mock('init', () => ({
    store: {
        getState: jest.fn(),
    },
}))

jest.mock('services', () => ({
    notificationSounds: {
        play: jest.fn(),
    },
}))

jest.mock('state/currentUser/selectors', () => ({
    getNotificationSettings: jest.fn(),
}))

const getNotificationSettingsMock =
    getNotificationSettings as unknown as jest.Mock

describe('browserNotification', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        PushJS.clear()
        getNotificationSettingsMock.mockReturnValue({
            data: {
                notification_sound: {
                    enabled: true,
                    sound: 'default',
                    volume: 5,
                },
            },
        })
    })

    describe('newMessage()', () => {
        it('should not play the sound notification', () => {
            const browserNotification = new BrowserNotification()
            browserNotification.newMessage({
                title: 'title',
                body: 'body',
                ticketId: 12,
                playSoundNotification: false,
            })
            expect(notificationSounds.play).toHaveBeenCalledTimes(0)
        })

        it.each([true, null, undefined])(
            'should play the default sound notification',
            (playSoundNotification) => {
                const browserNotification = new BrowserNotification()
                browserNotification.newMessage({
                    title: 'title',
                    body: 'body',
                    ticketId: 12,
                    playSoundNotification: playSoundNotification,
                })

                expect(notificationSounds.play).toHaveBeenCalledWith(
                    'default',
                    5
                )
            }
        )

        it('should require interaction', () => {
            const browserNotification = new BrowserNotification()
            browserNotification.newMessage({
                requireInteraction: true,
            })

            expect(
                (PushJS as unknown as {getAll: () => any[]}).getAll()
            ).toMatchSnapshot()
        })

        it('should create a browser notification with default values (empty)', () => {
            const browserNotification = new BrowserNotification()
            browserNotification.newMessage()

            expect(
                (PushJS as unknown as {getAll: () => any[]}).getAll()
            ).toMatchSnapshot()

            expect(notificationSounds.play).toHaveBeenCalledWith('default', 5)
        })

        it('should create a browser notification with default values (null values)', () => {
            const browserNotification = new BrowserNotification()
            browserNotification.newMessage({
                title: null,
                body: null,
                ticketId: null,
            })

            expect(
                (PushJS as unknown as {getAll: () => any[]}).getAll()
            ).toMatchSnapshot()
            expect(notificationSounds.play).toHaveBeenCalledWith('default', 5)
        })

        it('should create a browser notification with default values (empty values)', () => {
            const browserNotification = new BrowserNotification()
            browserNotification.newMessage({
                title: '',
                body: '',
            })

            expect(
                (PushJS as unknown as {getAll: () => any[]}).getAll()
            ).toMatchSnapshot()
            expect(notificationSounds.play).toHaveBeenCalledWith('default', 5)
        })

        it('should create a browser notification with default values (invalid values)', () => {
            const browserNotification = new BrowserNotification()
            browserNotification.newMessage({
                title: 1234,
                body: 1234,
            })

            expect(
                (PushJS as unknown as {getAll: () => any[]}).getAll()
            ).toMatchSnapshot()
            expect(notificationSounds.play).toHaveBeenCalledWith('default', 5)
        })

        it('should create a browser notification', () => {
            const browserNotification = new BrowserNotification()
            browserNotification.newMessage({
                title: 'title',
                body: 'body',
                ticketId: 12,
            })

            expect(
                (PushJS as unknown as {getAll: () => any[]}).getAll()
            ).toMatchSnapshot()
            expect(notificationSounds.play).toHaveBeenCalledWith('default', 5)
        })

        it('should display several notifications but play sound once', () => {
            const browserNotification = new BrowserNotification()
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

            expect(
                (PushJS as unknown as {getAll: () => any[]}).getAll()
            ).toMatchSnapshot()
            expect(notificationSounds.play).toHaveBeenCalledTimes(1)
        })
    })

    describe('newMessageThrottled()', () => {
        it('should display a single notification when called several times', () => {
            const browserNotification = new BrowserNotification()
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

            expect(
                (PushJS as unknown as {getAll: () => any[]}).getAll()
            ).toMatchSnapshot()
            expect(notificationSounds.play).toHaveBeenCalledTimes(1)
        })
    })
})
