import MockAdapter from 'axios-mock-adapter'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import {Map} from 'immutable'
import thunk from 'redux-thunk'

import {StoreDispatch} from '../../types'
import {initialState} from '../reducers'
import {fetchHTTPIntegrationEvent, fetchHTTPIntegrationEvents} from '../actions'
import client from '../../../models/api/resources'

type MockedRootState = {
    HTTPIntegrationEvent: Map<any, any>
}

const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares
)

describe('HTTPIntegrationEvents', () => {
    let store: MockStoreEnhanced<MockedRootState, StoreDispatch>
    let mockServer: MockAdapter

    describe('actions', () => {
        beforeEach(() => {
            store = mockStore({HTTPIntegrationEvent: initialState})
            mockServer = new MockAdapter(client)
        })

        describe('fetchHTTPIntegrationEvents', () => {
            it('should fetch events and dispatch FETCH_HTTP_INTEGRATION_EVENT_SUCCESS action', async (done) => {
                const integrationId = 1
                mockServer
                    .onGet(`/api/integrations/${integrationId}/events/`)
                    .reply(200, {data: [{id: 1}, {id: 2}]})
                await store.dispatch(fetchHTTPIntegrationEvents(integrationId))

                expect(store.getActions()).toMatchSnapshot()
                done()
            })

            it('should fetch events and dispatch ERROR action', async (done) => {
                const integrationId = 1
                mockServer
                    .onGet(`/api/integrations/${integrationId}/events/`)
                    .reply(500, {})
                await store.dispatch(fetchHTTPIntegrationEvents(integrationId))

                expect(store.getActions()).toMatchSnapshot()
                done()
            })
        })

        describe('fetchHTTPIntegrationEvent', () => {
            const integrationId = 1
            const eventId = 2

            it('should fetch events and dispatch FETCH_HTTP_INTEGRATION_EVENT_SUCCESS action', async (done) => {
                mockServer
                    .onGet(
                        `/api/integrations/${integrationId}/events/${eventId}`
                    )
                    .reply(200, {id: eventId})
                await store.dispatch(
                    fetchHTTPIntegrationEvent(integrationId, eventId)
                )

                expect(store.getActions()).toMatchSnapshot()
                done()
            })

            it('should fetch events and dispatch ERROR action', async (done) => {
                mockServer
                    .onGet(
                        `/api/integrations/${integrationId}/events/${eventId}`
                    )
                    .reply(500, {})
                await store.dispatch(
                    fetchHTTPIntegrationEvent(integrationId, eventId)
                )

                expect(store.getActions()).toMatchSnapshot()
                done()
            })
        })
    })
})
