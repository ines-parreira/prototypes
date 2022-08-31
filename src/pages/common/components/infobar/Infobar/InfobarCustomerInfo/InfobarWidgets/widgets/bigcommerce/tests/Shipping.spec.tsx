import React from 'react'
import {fromJS, Map} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {IntegrationContext} from 'providers/infobar/IntegrationContext'

import {AfterTitle} from '../Shipping'

const mockStore = configureMockStore([thunk])
const integrationContextData = {integration: fromJS({}), integrationId: 1}

describe('Shipping', () => {
    describe('<AfterTitle/>', () => {
        const minProps = {
            source: fromJS({}),
            isEditing: false,
            getIntegrationData: () => fromJS({}) as Map<any, any>,
        }

        it('should not render because widgets are being edited', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <AfterTitle {...minProps} isEditing />
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should match snapshot - fedex tracking link', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider
                        value={{
                            integrationId: 1,
                            integration: fromJS({
                                meta: {store_hash: 'pk360c6roo'},
                            }),
                        }}
                    >
                        <AfterTitle
                            {...minProps}
                            source={fromJS({
                                tracking_number: '111111111',
                                shipping_provider: 'fedex',
                            })}
                        />
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should match snapshot - no tracking link', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider
                        value={{
                            integrationId: 1,
                            integration: fromJS({
                                meta: {store_hash: 'pk360c6roo'},
                            }),
                        }}
                    >
                        <AfterTitle
                            {...minProps}
                            source={fromJS({
                                tracking_number: '111111111',
                                shipping_provider: 'none',
                            })}
                        />
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })
    })
})
