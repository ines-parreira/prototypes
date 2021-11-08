import MockAdapter from 'axios-mock-adapter'

jest.unmock('../resources')

import client, {handleNewRelease, createClient} from '../resources'
import {notify} from '../../../state/notifications/actions'

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
        const mockedHandler = handleNewRelease({dispatch: jest.fn()} as any)

        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        it('should notify and reload on new release', () => {
            mockedHandler({
                data: undefined,
                status: 200,
                statusText: 'ok',
                config: {},
                headers: {
                    'x-gorgias-release': '2',
                },
            })
            jest.runAllTimers()
            expect(
                (notify as jest.MockedFunction<typeof notify>).mock.calls
            ).toMatchSnapshot()
            expect(window.location.reload).toHaveBeenCalled()
        })
    })

    describe('createClient', () => {
        it('should return a proper new instance of axios', () => {
            expect(createClient().defaults).toMatchSnapshot()
        })
    })
})
