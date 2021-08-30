import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {BillingDetailsContainer} from '../BillingDetails.tsx'

describe('BillingDetails component', () => {
    it('should display loader while fetching a contact', () => {
        const component = shallow(
            <BillingDetailsContainer
                fetchContact={() => Promise.resolve()}
                contact={null}
            />
        )
        expect(component.dive()).toMatchSnapshot()
    })

    it('should render nothing if contact prop is null after fetching it', () => {
        const component = shallow(
            <BillingDetailsContainer
                fetchContact={() => Promise.resolve()}
                contact={null}
            />
        )
        component.setState({isLoading: false})
        expect(component).toMatchSnapshot()
    })

    it('should display billing contact information', () => {
        const component = shallow(
            <BillingDetailsContainer
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
        )
        component.setState({isLoading: false})
        expect(component).toMatchSnapshot()
    })
})
