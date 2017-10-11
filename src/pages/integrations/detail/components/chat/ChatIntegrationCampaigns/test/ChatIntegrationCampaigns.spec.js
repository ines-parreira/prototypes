import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import ChatIntegrationCampaigns from '../ChatIntegrationCampaigns'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('ChatIntegrationCampaigns component', () => {
    let store

    beforeEach(() => {
        store = mockStore({})
    })

    it('should display the empty state correctly', () => {
        const component = mount(
            <ChatIntegrationCampaigns
                store={store}
                integration={fromJS({
                    id: 118,
                    type: 'smooch_inside',
                    name: 'My new chat',
                    meta: {
                        campaigns: []
                    }
                })}
                updateCampaign={() => {}}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display the list correctly', () => {
        const component = mount(
            <ChatIntegrationCampaigns
                store={store}
                integration={fromJS({
                    id: 118,
                    type: 'smooch_inside',
                    name: 'My new chat',
                    meta: {
                        campaigns: [{
                            id: '156a4d-fg68h40-sd6f4',
                            name: 'Super campaign',
                            deactivated_datetime: null
                        }, {
                            id: 'not-so-good-campaign-d8f9-fds486-sf78',
                            name: 'Not so good campaign',
                            deactivated_datetime: '2017-10-06T17:17:56.565Z'
                        }]
                    }
                })}
                updateCampaign={() => {}}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
