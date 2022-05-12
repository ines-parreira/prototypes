import MockAdapter from 'axios-mock-adapter'

jest.unmock('../resources')

import {notify} from '../../../state/notifications/actions'
import client, {handleNewRelease, createClient, timeoutTime} from '../resources'

const mockedServer = new MockAdapter(client)

jest.mock('../../../state/notifications/actions')

describe('client resources', () => {
    beforeEach(() => {
        mockedServer.reset()
        jest.clearAllMocks()
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
                {'x-gorgias-release': '1'}
            )
            const res = await client.get('/api')

            expect(res).toMatchSnapshot()
        })

        it('should send a request with data', async () => {
            mockedServer
                .onPost('/api')
                .reply(200, undefined, {'x-gorgias-release': '1'})
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
        const mockedResponse = {
            data: undefined,
            status: 200,
            statusText: 'ok',
            config: {},
            headers: {},
        }
        const mockNewResponseHeaders = (releaseHeader: string) => ({
            ...mockedResponse,
            headers: {
                'x-gorgias-release': releaseHeader,
            },
        })
        const mockedStore = {dispatch: jest.fn()} as any

        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
            jest.resetModules()
        })

        it('should notify and reload on new release', () => {
            const {
                handleNewRelease: mockedHandler,
            }: {handleNewRelease: typeof handleNewRelease} =
                jest.requireActual('../resources')

            mockedHandler(mockedStore)(mockNewResponseHeaders('2'))
            jest.runAllTimers()
            expect(
                (notify as jest.MockedFunction<typeof notify>).mock.calls
            ).toMatchSnapshot()
            expect(window.location.reload).toHaveBeenCalled()
        })

        it('should set reload timeout only once', () => {
            const {
                handleNewRelease: mockedHandler,
            }: {handleNewRelease: typeof handleNewRelease} =
                jest.requireActual('../resources')
            mockedHandler(mockedStore)(mockNewResponseHeaders('2'))
            mockedHandler(mockedStore)(mockNewResponseHeaders('3'))
            jest.advanceTimersByTime(timeoutTime - 1)
            expect(window.setTimeout).toHaveBeenCalledTimes(1)
        })
    })

    describe('createClient', () => {
        it('should return a proper new instance of axios', () => {
            expect(createClient().defaults).toMatchSnapshot()
        })
    })
})
