import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {BillingDetailsFormContainer} from '../BillingDetailsForm.tsx'

jest.mock('../../../../../config/countries.json', () => [
    {label: 'France', value: 'FR'},
    {label: 'United States', value: 'US'},
])

describe('BillingDetailsForm component', () => {
    const mockStore = configureMockStore([thunk])
    const defaultState = {
        billing: fromJS({
            contact: {
                shipping: {
                    address: {},
                },
            },
        }),
    }
    let store

    beforeEach(() => {
        store = mockStore(defaultState)
    })

    it('should display loader', () => {
        const component = mount(
            <Provider store={store}>
                <BillingDetailsFormContainer
                    fetchContact={() => Promise.resolve()}
                    contact={null}
                    updateContact={null}
                />
            </Provider>
        )
        expect(component).toMatchSnapshot()
    })

    it('should display not display the form', () => {
        const component = mount(
            <Provider store={store}>
                <BillingDetailsFormContainer
                    fetchContact={() => Promise.resolve()}
                    contact={null}
                    updateContact={null}
                />
            </Provider>
        )
        component.find(BillingDetailsFormContainer).setState({isLoading: false})
        expect(component).toMatchSnapshot()
    })

    it('should display the form with billing contact information', () => {
        const component = mount(
            <Provider store={store}>
                <BillingDetailsFormContainer
                    updateContact={null}
                    fetchContact={() => Promise.resolve()}
                    contact={fromJS({
                        email: 'hello@acme.gorgias.io',
                        shipping: {
                            name: 'Gorgias',
                            phone: '4155555556',
                            address: {
                                line1: '52 Washburn St',
                                line2: '',
                                city: 'San Francisco',
                                state: 'CA',
                                country: 'United States',
                                postal_code: '94103',
                            },
                        },
                    })}
                />
            </Provider>
        )
        component.find(BillingDetailsFormContainer).setState({isLoading: false})
        expect(component).toMatchSnapshot()
    })
})
