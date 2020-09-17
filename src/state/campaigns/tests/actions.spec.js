import {fromJS} from 'immutable'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

import * as actions from '../actions'

// Would cause SecurityError
jest.mock('react-router', () => ({
    browserHistory: {
        push: () => {},
    },
}))

describe('Campaign actions', () => {
    let store
    let mockServer

    beforeEach(() => {
        store = mockStore({
            integrations: fromJS({}),
        })
        mockServer = new MockAdapter(axios)
    })

    const integration = fromJS({
        id: 1,
        type: 'smooch_inside',
    })

    const campaign = fromJS({
        id: '123-456',
    })

    describe('createCampaign', () => {
        it('should fetch the integration and execute onUpdateSuccess when creating a campaign successfully', () => {
            mockServer
                .onPost('/api/integrations/smooch_inside/1/campaigns/')
                .reply(201, {data: {id: '123-456'}})
            mockServer.onGet('/api/integrations/1').reply(200, {data: {}})
            mockServer.onGet('/api/integrations/').reply(200, {data: {}})

            return store
                .dispatch(actions.createCampaign(fromJS({}), integration))
                .then(() => {
                    let storeActions = store.getActions()

                    // Remove unique ids of notifications because they change every time
                    storeActions.forEach((action) => {
                        if (action.type === 'ADD_NOTIFICATION') {
                            delete action.payload.id
                        }
                    })

                    expect(storeActions).toMatchSnapshot()
                })
        })

        it('should notify an error when creating a campaign fails', () => {
            mockServer
                .onPost(
                    `/api/integrations/${integration.get(
                        'type'
                    )}/${integration.get('id')}/campaigns/`
                )
                .reply(400, {errors: 'stuff'})

            return store
                .dispatch(actions.createCampaign(fromJS({}), integration))
                .then(() => {
                    let storeActions = store.getActions()

                    // Remove unique ids of notifications because they change every time
                    storeActions.forEach((action) => {
                        if (action.type === 'ADD_NOTIFICATION') {
                            delete action.payload.id
                        }
                    })

                    expect(storeActions).toMatchSnapshot()
                })
        })
    })

    describe('updateCampaign', () => {
        it('should fetch the integration and execute onUpdateSuccess when updating a campaign successfully', () => {
            mockServer
                .onPut(
                    `/api/integrations/${integration.get(
                        'type'
                    )}/${integration.get('id')}/campaigns/${campaign.get('id')}`
                )
                .reply(202, {})
            mockServer.onGet('/api/integrations/1').reply(200, {data: {}})
            mockServer.onGet('/api/integrations/').reply(200, {data: {}})

            return store
                .dispatch(actions.updateCampaign(campaign, integration))
                .then(() => {
                    let storeActions = store.getActions()

                    // Remove unique ids of notifications because they change every time
                    storeActions.forEach((action) => {
                        if (action.type === 'ADD_NOTIFICATION') {
                            delete action.payload.id
                        }
                    })

                    expect(storeActions).toMatchSnapshot()
                })
        })

        it('should notify an error when updating a campaign fails', () => {
            mockServer
                .onPut(
                    `/api/integrations/${integration.get(
                        'type'
                    )}/${integration.get('id')}/campaigns/${campaign.get('id')}`
                )
                .reply(400, {errors: 'stuff'})

            return store
                .dispatch(actions.updateCampaign(campaign, integration))
                .then(() => {
                    let storeActions = store.getActions()

                    // Remove unique ids of notifications because they change every time
                    storeActions.forEach((action) => {
                        if (action.type === 'ADD_NOTIFICATION') {
                            delete action.payload.id
                        }
                    })

                    expect(storeActions).toMatchSnapshot()
                })
        })
    })

    describe('deleteCampaign', () => {
        it('should fetch the integration and execute onUpdateSuccess when deleting a campaign successfully', () => {
            mockServer
                .onDelete(
                    `/api/integrations/${integration.get(
                        'type'
                    )}/${integration.get('id')}/campaigns/${campaign.get('id')}`
                )
                .reply(204, {})
            mockServer.onGet('/api/integrations/1').reply(200, {data: {}})

            return store
                .dispatch(actions.updateCampaign(campaign, integration))
                .then(() => {
                    let storeActions = store.getActions()

                    // Remove unique ids of notifications because they change every time
                    storeActions.forEach((action) => {
                        if (action.type === 'ADD_NOTIFICATION') {
                            delete action.payload.id
                        }
                    })

                    expect(storeActions).toMatchSnapshot()
                })
        })

        it('should notify an error when deleting a campaign fails', () => {
            mockServer
                .onDelete(
                    `/api/integrations/${integration.get(
                        'type'
                    )}/${integration.get('id')}/campaigns/${campaign.get('id')}`
                )
                .reply(400, {errors: 'stuff'})

            return store
                .dispatch(actions.updateCampaign(campaign, integration))
                .then(() => {
                    let storeActions = store.getActions()

                    // Remove unique ids of notifications because they change every time
                    storeActions.forEach((action) => {
                        if (action.type === 'ADD_NOTIFICATION') {
                            delete action.payload.id
                        }
                    })

                    expect(storeActions).toMatchSnapshot()
                })
        })
    })
})
