import React, {ComponentProps, SyntheticEvent} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {
    basicMonthlyAutomationPrice,
    basicMonthlyHelpdeskPrice,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import {getFormattedAmount} from 'models/billing/utils'
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
jest.mock('../../../../../utils/stripe', () => ({
    createStripeCardToken: jest.fn().mockResolvedValue({id: '123'}),
}))

describe('CreditCard component', () => {
    const minProps = {
        currentAccount: fromJS({
            current_subscription: {
                products: {
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPrice.price_id,
                },
            },
        }),
        currentUser: fromJS({}),
        hasCreditCard: false,
        isMissingContactInformation: false,
        accountHasLegacyPlan: false,
        location: {},
        notify: jest.fn(),
        setCreditCard: jest.fn(),
        setCurrentSubscription: jest.fn(),
        updateCreditCard: jest.fn(),
        hasAutomationAddOn: false,
        automationAddOnAmount: 2,
        updateContact: jest.fn(),
        contact: fromJS({}),
        fetchContact: jest.fn(),
        fetchCreditCard: jest.fn(),
        currentHelpdeskPrice: basicMonthlyHelpdeskPrice,
        isCurrentHelpdeskCustom: basicMonthlyHelpdeskPrice.custom,
        currentHelpdeskAmount: getFormattedAmount(
            basicMonthlyHelpdeskPrice.amount
        ),
        currentHelpdeskCurrency: basicMonthlyHelpdeskPrice.currency,
        currentHelpdeskInterval: basicMonthlyHelpdeskPrice.interval,
        currentHelpdeskName: basicMonthlyHelpdeskPrice.name,
    } as unknown as ComponentProps<typeof CreditCardContainer>

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
                currentSubscription={fromJS({
                    status: 'active',
                })}
            />
        )
        component.setState({isStripeLoaded: true})
        expect(component).toMatchSnapshot()
    })

    it('should render billing plan card with automation footer when current plan is not active and has automation add-on', () => {
        const component = shallow(
            <CreditCardContainer
                {...minProps}
                currentSubscription={fromJS({
                    status: 'past_due',
                })}
                hasAutomationAddOn={true}
                automationAddOnFullAmount={2}
                currentAutomationPrice={basicMonthlyAutomationPrice}
            />
        )
        component.setState({isStripeLoaded: true})
        expect(component).toMatchSnapshot()
    })

    it('should render billing plan card with automation footer when current plan is not active and has automation add-on when the automation price is not discounted', () => {
        const component = shallow(
            <CreditCardContainer
                {...minProps}
                currentSubscription={fromJS({
                    status: 'past_due',
                })}
                hasAutomationAddOn={true}
                currentAutomationPrice={basicMonthlyAutomationPrice}
            />
        )
        component.setState({isStripeLoaded: true})
        expect(component).toMatchSnapshot()
    })

    it('should render the billing address form when account is missing contact information', () => {
        const component = shallow(
            <CreditCardContainer
                {...minProps}
                hasCreditCard
                isMissingContactInformation
                contact={null}
            />
        )
        component.setState({isStripeLoaded: true, isFetchingInfo: false})
        expect(component).toMatchSnapshot()
    })

    it('should not render the billing address form when a credit card has been added and the contact information is valid', () => {
        const component = shallow(
            <CreditCardContainer {...minProps} hasCreditCard />
        )
        component.setState({isStripeLoaded: true})
        expect(component).toMatchSnapshot()
    })

    it('should update contact information when submitting the form', (done) => {
        ;(
            minProps.updateContact as jest.MockedFunction<
                typeof minProps.updateContact
            >
        ).mockResolvedValue({})
        const component = shallow<CreditCardContainer>(
            <CreditCardContainer {...minProps} />
        )
        component.setState({
            contactForm: {
                email: 'foo',
                shipping: {
                    address: {
                        city: '',
                        country: 'FR',
                        line1: '',
                        line2: '',
                        postal_code: '75000',
                        state: '',
                    },
                    name: '',
                    phone: '',
                },
            },
            isStripeLoaded: true,
            expDate: '12/12',
            isFetchingInfo: false,
        })

        void component
            .instance()
            ._submit(new Event('foo') as unknown as SyntheticEvent)
        setImmediate(() => {
            expect(minProps.updateContact).toHaveBeenCalled()
            done()
        })
    })

    it('should fetch contact and credit card information when the information is missing', () => {
        shallow<CreditCardContainer>(<CreditCardContainer {...minProps} />)

        expect(minProps.fetchCreditCard).toHaveBeenCalled()
        jest.resetAllMocks()
        shallow<CreditCardContainer>(
            <CreditCardContainer
                {...minProps}
                hasCreditCard
                isMissingContactInformation
            />
        )

        expect(minProps.fetchContact).toHaveBeenCalled()
    })
})
