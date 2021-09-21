import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import GorgiasChatIntegrationCampaigns from '../GorgiasChatIntegrationCampaigns.tsx'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('../../../../../../common/utils/withPaywall.tsx', () => () => {
    return (Component) => (props) => {
        return <Component {...props} />
    }
})

describe('<GorgiasChatIntegrationCampaigns/>', () => {
    let store

    beforeEach(() => {
        store = mockStore({})
    })

    describe('render()', () => {
        it('should display the empty state correctly', () => {
            const {container} = render(
                <GorgiasChatIntegrationCampaigns
                    store={store}
                    integration={fromJS({
                        id: 118,
                        type: 'gorgias_chat',
                        name: 'My new chat',
                        meta: {
                            campaigns: [],
                        },
                    })}
                    updateCampaign={() => {}}
                />
            )

            expect(container).toMatchSnapshot()
        })

        it('should display the list correctly', () => {
            const {container} = render(
                <GorgiasChatIntegrationCampaigns
                    store={store}
                    integration={fromJS({
                        id: 118,
                        type: 'gorgias_chat',
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
                    updateCampaign={() => {}}
                />
            )

            expect(container).toMatchSnapshot()
        })
    })
})
