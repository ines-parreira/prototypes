import {render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'

import logo from 'assets/img/icons/logo.png'
import {RootState, StoreDispatch} from 'state/types'

import FacebookIntegrationDetailSummary from '../FacebookIntegrationDetailSummary'

describe('<FacebookIntegrationDetailSummary/>', () => {
    let store: MockStoreEnhanced

    beforeEach(() => {
        const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>(
            [thunk]
        )

        store = mockStore()
    })
    it('should display the icon, name, description', () => {
        const {container} = render(
            <Provider store={store}>
                <FacebookIntegrationDetailSummary
                    icon={logo}
                    name="Facebook Page"
                    description="A page to test Facebook integration"
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
