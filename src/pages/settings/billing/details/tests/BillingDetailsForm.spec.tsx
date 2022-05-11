import React, {ComponentProps} from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {RootState} from 'state/types'

import {BillingDetailsFormContainer} from '../BillingDetailsForm'

jest.mock('config/countries', () => {
    const countryConfig = jest.requireActual('config/countries')
    return {
        ...countryConfig,
        countries: [
            {label: 'France', value: 'FR'},
            {
                label: 'United States',
                value: 'US',
            },
        ],
    } as unknown
})

describe('BillingDetailsForm component', () => {
    const mockStore = configureMockStore([thunk])
    const defaultState: Partial<RootState> = {
        billing: fromJS({
            contact: {
                shipping: {
                    address: {},
                },
            },
        }),
    }

    const minProps: ComponentProps<typeof BillingDetailsFormContainer> = {
        fetchContact: () => Promise.resolve(),
        contact: null,
        updateContact: jest.fn(),
    }

    let store: MockStoreEnhanced<unknown>

    beforeEach(() => {
        store = mockStore(defaultState)
    })

    it('should display loader', () => {
        const component = mount(
            <Provider store={store}>
                <BillingDetailsFormContainer {...minProps} />
            </Provider>
        )
        expect(component).toMatchSnapshot()
    })

    it('should display not display the form', () => {
        const component = mount(
            <Provider store={store}>
                <BillingDetailsFormContainer {...minProps} />
            </Provider>
        )
        component.find(BillingDetailsFormContainer).setState({isLoading: false})
        expect(component).toMatchSnapshot()
    })

    it('should display the form with billing contact information', () => {
        const component = mount(
            <Provider store={store}>
                <BillingDetailsFormContainer
                    {...minProps}
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
