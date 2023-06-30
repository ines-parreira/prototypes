import PushJS from 'push.js'

import {getLDClient} from 'utils/launchDarkly'
import {flushPromises} from 'utils/testing'

import {BrowserNotification} from '../browserNotification'

jest.mock('init', () => ({
    store: {
        getState: jest.fn(),
    },
}))

jest.mock('utils/launchDarkly', () => ({
    getLDClient: jest.fn(() => ({
        on: jest.fn(),
    })),
}))

jest.mock('services', () => ({
    notificationSounds: {
        play: jest.fn(),
    },
}))

const getLDClientMock = getLDClient as jest.Mock

describe('browserNotification', () => {
    let spy: ReturnType<typeof jest.spyOn>
    let variation: jest.Mock

    beforeEach(() => {
        jest.resetAllMocks()
        PushJS.clear()

        spy = jest
            .spyOn(global.HTMLMediaElement.prototype, 'play')
            .mockResolvedValue(undefined)

        variation = jest.fn().mockReturnValue(false)
        const waitForInitialization = jest.fn().mockResolvedValue(undefined)

        getLDClientMock.mockReturnValue({
            on: jest.fn(),
            variation,
            waitForInitialization,
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
            expect(spy).toHaveBeenCalledTimes(0)
        })

        it.each([true, null, undefined])(
            'should play the default sound notification',
            async (playSoundNotification) => {
                const browserNotification = new BrowserNotification()
                browserNotification.newMessage({
                    title: 'title',
                    body: 'body',
                    ticketId: 12,
                    playSoundNotification: playSoundNotification,
                })

                await flushPromises()

                expect(spy).toHaveBeenCalledWith()
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

        it('should create a browser notification with default values (empty)', async () => {
            const browserNotification = new BrowserNotification()
            browserNotification.newMessage()

            await flushPromises()

            expect(
                (PushJS as unknown as {getAll: () => any[]}).getAll()
            ).toMatchSnapshot()

            expect(spy).toHaveBeenCalledWith()
        })

        it('should create a browser notification with default values (null values)', async () => {
            const browserNotification = new BrowserNotification()
            browserNotification.newMessage({
                title: null,
                body: null,
                ticketId: null,
            })

            await flushPromises()

            expect(
                (PushJS as unknown as {getAll: () => any[]}).getAll()
            ).toMatchSnapshot()
            expect(spy).toHaveBeenCalledWith()
        })

        it('should create a browser notification with default values (empty values)', async () => {
            const browserNotification = new BrowserNotification()
            browserNotification.newMessage({
                title: '',
                body: '',
            })

            await flushPromises()

            expect(
                (PushJS as unknown as {getAll: () => any[]}).getAll()
            ).toMatchSnapshot()
            expect(spy).toHaveBeenCalledWith()
        })

        it('should create a browser notification with default values (invalid values)', async () => {
            const browserNotification = new BrowserNotification()
            browserNotification.newMessage({
                title: 1234,
                body: 1234,
            })

            await flushPromises()

            expect(
                (PushJS as unknown as {getAll: () => any[]}).getAll()
            ).toMatchSnapshot()
            expect(spy).toHaveBeenCalledWith()
        })

        it('should create a browser notification', async () => {
            const browserNotification = new BrowserNotification()
            browserNotification.newMessage({
                title: 'title',
                body: 'body',
                ticketId: 12,
            })

            await flushPromises()

            expect(
                (PushJS as unknown as {getAll: () => any[]}).getAll()
            ).toMatchSnapshot()
            expect(spy).toHaveBeenCalledWith()
        })

        it('should display several notifications but play sound once', async () => {
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

            await flushPromises()

            expect(
                (PushJS as unknown as {getAll: () => any[]}).getAll()
            ).toMatchSnapshot()
            expect(spy).toHaveBeenCalledTimes(1)
        })
    })

    describe('newMessageThrottled()', () => {
        it('should display a single notification when called several times', async () => {
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

            await flushPromises()

            expect(
                (PushJS as unknown as {getAll: () => any[]}).getAll()
            ).toMatchSnapshot()
            expect(spy).toHaveBeenCalledTimes(1)
        })
    })
})
