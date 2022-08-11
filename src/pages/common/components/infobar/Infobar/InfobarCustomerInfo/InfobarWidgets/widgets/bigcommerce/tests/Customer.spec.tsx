import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {IntegrationContext} from 'providers/infobar/IntegrationContext'

import {TitleWrapper} from '../Customer'

const mockStore = configureMockStore([thunk])
const store = mockStore({})

const integrationContextData = {
    integration: fromJS({meta: {store_hash: 'pk360c6roo'}}),
    integrationId: 1,
}

describe('Customer', () => {
    describe('TitleWrapper', () => {
        it('should render default link', () => {
            const {container} = render(
                <Provider store={store}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <TitleWrapper
                            source={fromJS({
                                id: '1',
                            })}
                        />{' '}
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })
    })
})
