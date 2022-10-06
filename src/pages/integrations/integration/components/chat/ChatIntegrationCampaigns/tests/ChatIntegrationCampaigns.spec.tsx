import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import ChatIntegrationCampaigns from '../ChatIntegrationCampaigns'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('ChatIntegrationCampaigns component', () => {
    let store = mockStore({})

    beforeEach(() => {
        store = mockStore({})
    })

    it('should display the empty state correctly', () => {
        const {container} = render(
            <Provider store={store}>
                <ChatIntegrationCampaigns
                    integration={fromJS({
                        id: 118,
                        type: 'smooch_inside',
                        name: 'My new chat',
                        meta: {
                            campaigns: [],
                        },
                    })}
                />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should display the list correctly', () => {
        const {container} = render(
            <Provider store={store}>
                <ChatIntegrationCampaigns
                    integration={fromJS({
                        id: 118,
                        type: 'smooch_inside',
                        name: 'My new chat',
                        meta: {
                            campaigns: [
                                {
                                    id: '156a4d-fg68h40-sd6f4',
                                    name: 'Super campaign',
                                    deactivated_datetime: null,
                                },
                                {
                                    id: 'not-so-good-campaign-d8f9-fds486-sf78',
                                    name: 'Not so good campaign',
                                    deactivated_datetime:
                                        '2017-10-06T17:17:56.565Z',
                                },
                            ],
                        },
                    })}
                />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })
})
