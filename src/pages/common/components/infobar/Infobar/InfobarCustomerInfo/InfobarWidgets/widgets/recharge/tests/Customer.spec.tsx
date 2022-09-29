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
    integration: fromJS({meta: {store_name: 'mystore'}}),
    integrationId: 1,
}

describe('Customer', () => {
    describe('TitleWrapper', () => {
        it('should render default link because no custom link is set', () => {
            const {container} = render(
                <Provider store={store}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <TitleWrapper
                            source={fromJS({
                                id: '92837589347',
                                hash: 'a8s4d86as54d',
                            })}
                            template={fromJS({})}
                        />{' '}
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should render custom link because it is set', () => {
            const {container} = render(
                <Provider store={store}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <TitleWrapper
                            source={fromJS({
                                id: '92837589347',
                                hash: 'a8s4d86as54d',
                            })}
                            template={fromJS({
                                meta: {link: 'https://gorgias.io/{{hash}}/'},
                            })}
                        />{' '}
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })
    })
})
