import MockAdapter from 'axios-mock-adapter'

import {initialState} from '../reducers.ts'
import {
    fetchHTTPIntegrationEvent,
    fetchHTTPIntegrationEvents,
} from '../actions.ts'
import {mockStore} from '../../../utils/testing.tsx'
import client from '../../../models/api/resources.ts'

describe('HTTPIntegrationEvents', () => {
    let store = null
    let mockServer = null

    describe('actions', () => {
        beforeEach(() => {
            store = mockStore({HTTPIntegrationEvent: initialState})
            mockServer = new MockAdapter(client)
        })

        describe('fetchHTTPIntegrationEvents', () => {
            it('should fetch events and dispatch FETCH_HTTP_INTEGRATION_EVENT_SUCCESS action', (done) => {
                const integrationId = 1
                mockServer
                    .onGet(`/api/integrations/${integrationId}/events/`)
                    .reply(200, {data: [{id: 1}, {id: 2}]})
                store
                    .dispatch(fetchHTTPIntegrationEvents(integrationId))
                    .then(() => {
                        expect(store.getActions()).toMatchSnapshot()
                        done()
                    })
            })

            it('should fetch events and dispatch ERROR action', (done) => {
                const integrationId = 1
                mockServer
                    .onGet(`/api/integrations/${integrationId}/events/`)
                    .reply(500, {})
                store
                    .dispatch(fetchHTTPIntegrationEvents(integrationId))
                    .then(() => {
                        expect(store.getActions()).toMatchSnapshot()
                        done()
                    })
            })
        })

        describe('fetchHTTPIntegrationEvent', () => {
            const integrationId = 1
            const eventId = 2

            it('should fetch events and dispatch FETCH_HTTP_INTEGRATION_EVENT_SUCCESS action', (done) => {
                mockServer
                    .onGet(
                        `/api/integrations/${integrationId}/events/${eventId}`
                    )
                    .reply(200, {id: eventId})
                store
                    .dispatch(fetchHTTPIntegrationEvent(integrationId, eventId))
                    .then(() => {
                        expect(store.getActions()).toMatchSnapshot()
                        done()
                    })
            })

            it('should fetch events and dispatch ERROR action', (done) => {
                mockServer
                    .onGet(
                        `/api/integrations/${integrationId}/events/${eventId}`
                    )
                    .reply(500, {})
                store
                    .dispatch(fetchHTTPIntegrationEvent(integrationId, eventId))
                    .then(() => {
                        expect(store.getActions()).toMatchSnapshot()
                        done()
                    })
            })
        })
    })
})
