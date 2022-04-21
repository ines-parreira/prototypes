import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'

import client from '../../../../../../../models/api/resources.ts'
import * as actions from '../actions.ts'

describe('FacebookIntegrationInstagramAds actions', () => {
    let store
    let mockServer

    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)

    beforeEach(() => {
        store = mockStore()
        mockServer = new MockAdapter(client)
    })

    describe('fetchAds()', () => {
        it('should fetch ads', async () => {
            const data = {
                1: {
                    ads: {
                        postid1: {
                            name: 'ad 1',
                            is_active: true,
                        },
                    },
                },
            }

            mockServer
                .onGet('/integrations/facebook/fads/state/')
                .reply(200, data)

            await store.dispatch(actions.fetchAds())
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('updateAd()', () => {
        it('should activate ad', async () => {
            const body = {
                integration_id: 1,
                ad_id: 'postid1',
                is_active: true,
            }

            mockServer
                .onPut('/integrations/facebook/fads/fad/activate/', body)
                .reply(200)

            await store.dispatch(actions.updateAd(1, 'postid1', true))
            expect(store.getActions()).toMatchSnapshot()
        })

        it('should deactivate ad', async () => {
            const body = {
                integration_id: 1,
                ad_id: 'postid1',
                is_active: false,
            }

            mockServer
                .onPut('/integrations/facebook/fads/fad/activate/', body)
                .reply(200)

            await store.dispatch(actions.updateAd(1, 'postid1', false))
            expect(store.getActions()).toMatchSnapshot()
        })
    })
})
