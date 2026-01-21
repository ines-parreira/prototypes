import { AxiosHeaders } from 'axios'
import MockAdapter from 'axios-mock-adapter'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { notify } from 'state/notifications/actions'

import type { handleNewRelease } from '../resources'
import client, { createClient, timeoutTime } from '../resources'

jest.unmock('../resources')

const mockedServer = new MockAdapter(client)

jest.mock('state/notifications/actions')
describe('client resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('resources axios instance', () => {
        it('should resolve with data', async () => {
            mockedServer.onGet('/api').reply(
                200,
                {
                    data: {
                        foo_bar: 1,
                    },
                },
                { 'x-gorgias-release': '1' },
            )
            const res = await client.get('/api')

            expect(res).toMatchSnapshot()
        })

        it('should send a request with data', async () => {
            mockedServer
                .onPost('/api')
                .reply(200, undefined, { 'x-gorgias-release': '1' })
            await client.post('/api', {
                foo_bar: 'foo',
                foo: [
                    {
                        foo_bar: 'foo',
                    },
                ],
            })
            expect(mockedServer.history).toMatchSnapshot()
        })
    })

    describe('handleNewRelease interceptor', () => {
        const mockedResponse = axiosSuccessResponse(undefined)

        const mockNewResponseHeaders = (releaseHeader: string) => ({
            ...mockedResponse,
            headers: new AxiosHeaders({
                'x-gorgias-release': releaseHeader,
            }),
        })
        const mockedStore = { dispatch: jest.fn() } as any

        beforeEach(() => {
            jest.useFakeTimers()
            jest.spyOn(window, 'setTimeout')
            window.GORGIAS_RELEASE = '1'
        })

        afterEach(() => {
            jest.useRealTimers()
            jest.resetModules()
        })

        it('should notify and reload on new release', () => {
            const {
                handleNewRelease: mockedHandler,
            }: { handleNewRelease: typeof handleNewRelease } =
                jest.requireActual('../resources')

            mockedHandler(mockedStore)(mockNewResponseHeaders('2'))
            jest.runAllTimers()
            expect(
                (notify as jest.MockedFunction<typeof notify>).mock.calls,
            ).toMatchSnapshot()
            expect(window.location.reload).toHaveBeenCalled()
        })

        it('should set reload timeout only once', () => {
            const {
                handleNewRelease: mockedHandler,
            }: { handleNewRelease: typeof handleNewRelease } =
                jest.requireActual('../resources')
            mockedHandler(mockedStore)(mockNewResponseHeaders('2'))
            mockedHandler(mockedStore)(mockNewResponseHeaders('3'))
            jest.advanceTimersByTime(timeoutTime - 1)
            expect(window.setTimeout).toHaveBeenCalledTimes(1)
        })

        it('should not schedule reload when call is active', () => {
            jest.isolateModules(() => {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { registerCallStateCallback } = require('@repo/utils')
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const {
                    handleNewRelease: mockedHandler,
                } = require('../resources')

                registerCallStateCallback(() => true)

                mockedHandler(mockedStore)(mockNewResponseHeaders('2'))
                jest.runAllTimers()

                expect(window.setTimeout).not.toHaveBeenCalled()
                const dispatchCalls = mockedStore.dispatch.mock.calls
                expect(dispatchCalls.length).toBe(0)
                expect(window.location.reload).not.toHaveBeenCalled()
            })
        })

        it('should show notification but prevent automatic reload if call is active when timeout fires', () => {
            jest.isolateModules(() => {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { registerCallStateCallback } = require('@repo/utils')
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const {
                    handleNewRelease: mockedHandler,
                } = require('../resources')

                registerCallStateCallback(() => false)

                mockedHandler(mockedStore)(mockNewResponseHeaders('2'))

                expect(window.setTimeout).toHaveBeenCalled()

                registerCallStateCallback(() => true)
                jest.runAllTimers()

                const dispatchCalls = mockedStore.dispatch.mock.calls
                expect(dispatchCalls.length).toBe(1)
                expect(window.location.reload).not.toHaveBeenCalled()
            })
        })
    })

    describe('createClient', () => {
        it('should return a proper new instance of axios', () => {
            expect(createClient().defaults).toMatchSnapshot()
        })
    })
})
