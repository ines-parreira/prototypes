import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {RootState, StoreDispatch} from 'state/types'

import GorgiasChatIntegrationCampaigns from '../GorgiasChatIntegrationCampaigns'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<GorgiasChatIntegrationCampaigns/>', () => {
    let store: MockStoreEnhanced<Partial<RootState>, StoreDispatch>

    beforeEach(() => {
        store = mockStore({})
    })

    const minProps: ComponentProps<typeof GorgiasChatIntegrationCampaigns> = {
        integration: fromJS({}),
    }

    describe('render()', () => {
        it('should display the empty state correctly', () => {
            const {container} = render(
                <Provider store={store}>
                    <GorgiasChatIntegrationCampaigns
                        {...minProps}
                        integration={fromJS({
                            id: 118,
                            type: 'gorgias_chat',
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
                    <GorgiasChatIntegrationCampaigns
                        {...minProps}
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
                    />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })
    })
})
