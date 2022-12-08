import MockAdapter from 'axios-mock-adapter'

import {OrderDirection} from 'models/api/types'

import {
    events as eventsFixtures,
    eventsServerMeta,
} from '../../../fixtures/event'
import client from '../../api/resources'
import {fetchEvents} from '../resources'
import {EventSortableProperties} from '../types'

const mockedServer = new MockAdapter(client)

describe('event resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('fetchEvents', () => {
        it('should resolve with an Event list on success', async () => {
            mockedServer.onGet('/api/events/').reply(200, {
                data: eventsFixtures,
                meta: eventsServerMeta,
            })
            const res = await fetchEvents()
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer.onGet('/api/events/').reply(503, {message: 'error'})
            return expect(fetchEvents()).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })

        it('should format option value to snake_case', async () => {
            mockedServer.onGet('/api/events/').reply(200, {
                data: eventsFixtures,
                meta: eventsServerMeta,
            })
            await fetchEvents({
                orderBy: `${EventSortableProperties.CreatedDatetime}:${OrderDirection.Asc}`,
            })
            expect(mockedServer.history).toMatchSnapshot()
        })
    })
})
