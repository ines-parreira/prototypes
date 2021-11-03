import MockAdapter from 'axios-mock-adapter'

import client from '../resources'

const mockedServer = new MockAdapter(client)

describe('client resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('resources axios instance', () => {
        it('should resolve with data', async () => {
            mockedServer.onGet('/api').reply(200, {
                data: {
                    foo_bar: 1,
                },
            })
            const res = await client.get('/api')
            expect(res).toMatchSnapshot()
        })

        it('should send a request with data', async () => {
            mockedServer.onPost('/api').reply(200)
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
})
