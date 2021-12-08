import {fromJS, Map} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import thunk from 'redux-thunk'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'

import * as actions from '../actions'
import client from '../../../models/api/resources'
import {GorgiasAction, StoreDispatch} from '../../types'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

// Would cause SecurityError
jest.mock('../../../pages/history')

describe('Campaign actions', () => {
    let store: MockStoreEnhanced<unknown, StoreDispatch>
    let mockServer: MockAdapter

    beforeEach(() => {
        store = mockStore({
            integrations: fromJS({}),
        })
        mockServer = new MockAdapter(client)
    })

    const integration: Map<any, any> = fromJS({
        id: 1,
        type: 'smooch_inside',
    })
    const campaign: Map<any, any> = fromJS({
        id: '123-456',
    })

    describe('createCampaign', () => {
        it('should fetch the integration and execute onUpdateSuccess when creating a campaign successfully', () => {
            mockServer
                .onPost('/api/integrations/smooch_inside/1/campaigns/')
                .reply(201, {
                    data: {
                        id: '123-456',
                    },
                })
            mockServer.onGet('/api/integrations/1').reply(200, {
                data: {},
            })
            mockServer.onGet('/api/integrations/').reply(200, {
                data: {},
            })
            return store
                .dispatch(actions.createCampaign(fromJS({}), integration))
                .then(() => {
                    const storeActions = store.getActions()
                    // Remove unique ids of notifications because they change every time
                    storeActions.forEach((action: GorgiasAction) => {
                        if (action.type === 'ADD_NOTIFICATION') {
                            delete (action.payload as Record<string, unknown>)
                                .id
                        }
                    })
                    expect(storeActions).toMatchSnapshot()
                })
        })

        it('should notify an error when creating a campaign fails', () => {
            mockServer
                .onPost(
                    `/api/integrations/${integration.get('type') as string}/${
                        integration.get('id') as string
                    }/campaigns/`
                )
                .reply(400, {
                    errors: 'stuff',
                })
            return store
                .dispatch(actions.createCampaign(fromJS({}), integration))
                .then(() => {
                    const storeActions = store.getActions()
                    // Remove unique ids of notifications because they change every time
                    storeActions.forEach((action: GorgiasAction) => {
                        if (action.type === 'ADD_NOTIFICATION') {
                            delete (action.payload as Record<string, unknown>)
                                .id
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
                    `/api/integrations/${integration.get('type') as string}/${
                        integration.get('id') as string
                    }/campaigns/${campaign.get('id') as string}`
                )
                .reply(202, {})
            mockServer.onGet('/api/integrations/1').reply(200, {
                data: {},
            })
            mockServer.onGet('/api/integrations/').reply(200, {
                data: {},
            })
            return store
                .dispatch(actions.updateCampaign(campaign, integration))
                .then(() => {
                    const storeActions = store.getActions()
                    // Remove unique ids of notifications because they change every time
                    storeActions.forEach((action: GorgiasAction) => {
                        if (action.type === 'ADD_NOTIFICATION') {
                            delete (action.payload as Record<string, unknown>)
                                .id
                        }
                    })
                    expect(storeActions).toMatchSnapshot()
                })
        })

        it('should notify an error when updating a campaign fails', () => {
            mockServer
                .onPut(
                    `/api/integrations/${integration.get('type') as string}/${
                        integration.get('id') as string
                    }/campaigns/${campaign.get('id') as string}`
                )
                .reply(400, {
                    errors: 'stuff',
                })
            return store
                .dispatch(actions.updateCampaign(campaign, integration))
                .then(() => {
                    const storeActions = store.getActions()
                    // Remove unique ids of notifications because they change every time
                    storeActions.forEach((action: GorgiasAction) => {
                        if (action.type === 'ADD_NOTIFICATION') {
                            delete (action.payload as Record<string, unknown>)
                                .id
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
                    `/api/integrations/${integration.get('type') as string}/${
                        integration.get('id') as string
                    }/campaigns/${campaign.get('id') as string}`
                )
                .reply(204, {})
            mockServer.onGet('/api/integrations/1').reply(200, {
                data: {},
            })
            return store
                .dispatch(actions.updateCampaign(campaign, integration))
                .then(() => {
                    const storeActions = store.getActions()
                    // Remove unique ids of notifications because they change every time
                    storeActions.forEach((action: GorgiasAction) => {
                        if (action.type === 'ADD_NOTIFICATION') {
                            delete (action.payload as Record<string, unknown>)
                                .id
                        }
                    })
                    expect(storeActions).toMatchSnapshot()
                })
        })

        it('should notify an error when deleting a campaign fails', () => {
            mockServer
                .onDelete(
                    `/api/integrations/${integration.get('type') as string}/${
                        integration.get('id') as string
                    }/campaigns/${campaign.get('id') as string}`
                )
                .reply(400, {
                    errors: 'stuff',
                })
            return store
                .dispatch(actions.updateCampaign(campaign, integration))
                .then(() => {
                    const storeActions = store.getActions()
                    // Remove unique ids of notifications because they change every time
                    storeActions.forEach((action: GorgiasAction) => {
                        if (action.type === 'ADD_NOTIFICATION') {
                            delete (action.payload as Record<string, unknown>)
                                .id
                        }
                    })
                    expect(storeActions).toMatchSnapshot()
                })
        })
    })
})
