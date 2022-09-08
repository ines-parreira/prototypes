import MockAdapter from 'axios-mock-adapter'

import {shopifyWidget} from 'fixtures/widgets.js'
import client from 'models/api/resources'

import {fetchWidgets} from '../resources'

const mockedServer = new MockAdapter(client)

describe('widgets resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('fetchWidgets', () => {
        it('should resolve with a list of widgets on success', async () => {
            mockedServer.onGet('/api/widgets/').reply(200, {
                data: [shopifyWidget],
            })

            const res = await fetchWidgets()
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer.onGet('/api/widgets/').reply(503, {message: 'error'})
            return expect(fetchWidgets()).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })
})
