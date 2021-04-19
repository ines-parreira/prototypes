import React from 'react'
import {render} from '@testing-library/react'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'

import {RootState, StoreDispatch} from '../../../../../../state/types'
import PhoneIntegrationName from '../PhoneIntegrationName'

describe('<PhoneIntegrationName/>', () => {
    let store: MockStoreEnhanced
    const integrationId = 1
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    beforeEach(() => {
        jest.resetAllMocks()

        store = mockStore({
            integrations: fromJS({
                integrations: [
                    {
                        id: integrationId,
                        name: 'My Phone Integration',
                        meta: {emoji: '❤️'},
                    },
                ],
            }),
        })
    })

    it('should render', () => {
        const {container} = render(
            <Provider store={store}>
                <PhoneIntegrationName integrationId={integrationId} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render as primary', () => {
        const {container} = render(
            <Provider store={store}>
                <PhoneIntegrationName integrationId={integrationId} primary />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
