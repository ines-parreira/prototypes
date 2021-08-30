import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {CreditCardContainer} from '../CreditCard'
import history from '../../../../history'

jest.mock('../../../../history')
jest.mock('../../../../../utils', () => {
    const utils: Record<string, unknown> = jest.requireActual(
        '../../../../../utils'
    )
    return {
        ...utils,
        loadScript: jest.fn(),
    }
})

describe('CreditCard component', () => {
    const minProps = ({
        currentAccount: fromJS({}),
        currentUser: fromJS({}),
        hasCreditCard: false,
        accountHasLegacyPlan: false,
        location: {},
        notify: jest.fn(),
        setCreditCard: jest.fn(),
        setCurrentSubscription: jest.fn(),
        updateCreditCard: jest.fn(),
    } as unknown) as ComponentProps<typeof CreditCardContainer>

    it('should display loader while fetching stripe SDK', () => {
        const component = shallow(<CreditCardContainer {...minProps} />)
        expect(component).toMatchSnapshot()
    })

    it('should render nothing if loaded, but no current subscription is set', () => {
        const component = shallow(<CreditCardContainer {...minProps} />)
        component.setState({isStripeLoaded: true})
        expect(history.push).toHaveBeenNthCalledWith(
            1,
            '/app/settings/billing/'
        )
        expect(component).toMatchSnapshot()
    })

    it('should display credit card form', () => {
        const component = shallow(
            <CreditCardContainer
                {...minProps}
                currentPlan={fromJS({
                    name: 'basic',
                    currencySign: '$',
                    amount: 1000,
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
