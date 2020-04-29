//@flow
import React from 'react'
import {browserHistory} from 'react-router'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {CreditCard} from '../CreditCard'

jest.mock('react-router')
jest.mock('../../../../../utils', () => {
    return {
        ...jest.requireActual('../../../../../utils'),
        loadScript: jest.fn(),
    }
})

describe('CreditCard component', () => {
    const minProps = {
        currentAccount: fromJS({}),
        currentUser: fromJS({}),
        hasCreditCard: false,
        location: {},
        notify: jest.fn(),
        setCreditCard: jest.fn(),
        setCurrentSubscription: jest.fn(),
        updateCreditCard: jest.fn(),
    }

    it('should display loader while fetching stripe SDK', () => {
        const component = shallow(
            <CreditCard {...minProps}/>
        )
        expect(component).toMatchSnapshot()
    })

    it('should render nothing if loaded, but no current subscription is set', () => {
        const component = shallow(
            <CreditCard {...minProps}/>
        )
        component.setState({isStripeLoaded: true})
        expect(browserHistory.push).toHaveBeenNthCalledWith(1, '/app/settings/billing/')
        expect(component).toMatchSnapshot()
    })

    it('should display credit card form', () => {
        const component = shallow(
            <CreditCard
                {...minProps}
                currentPlan={fromJS({
                    name: 'basic',
                    currencySign: '$',
                    amount: 1000
                })}
                currentSubscription={fromJS({
                    status: 'active',
                })}
            />
        )
        component.setState({isStripeLoaded: true})
        expect(component).toMatchSnapshot()
    })
})
