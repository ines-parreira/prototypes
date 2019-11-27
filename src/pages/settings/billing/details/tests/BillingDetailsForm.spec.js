import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'

import {BillingDetailsForm} from '../BillingDetailsForm'

describe('BillingDetailsForm component', () => {
    it('should display loader', () => {
        const component = mount(
            <BillingDetailsForm
                fetchContact={() => Promise.resolve()}
                contact={null}
                updateContact={null}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should display not display the form', () => {
        const component = mount(
            <BillingDetailsForm
                fetchContact={() => Promise.resolve()}
                contact={null}
                updateContact={null}
            />
        )
        component.setState({isLoading: false})
        expect(component).toMatchSnapshot()
    })

    it('should display the form with billing contact information', () => {
        const component = mount(
            <BillingDetailsForm
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
                            postal_code: '94103'
                        }
                    }
                })}
            />
        )
        component.setState({isLoading: false})
        expect(component).toMatchSnapshot()
    })
})
