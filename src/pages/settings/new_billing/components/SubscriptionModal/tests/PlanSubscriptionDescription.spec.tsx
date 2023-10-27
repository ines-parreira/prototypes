import {render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import PlanSubscriptionDescription, {
    PlanSubscriptionDescriptionProps,
} from 'pages/settings/new_billing/components/SubscriptionModal/PlanSubscriptionDescription'
import {ProductType} from 'models/billing/types'
import {convertProduct} from 'fixtures/productPrices'
import {mockStore} from 'utils/testing'
import {PRODUCT_SUBSCRIPTION_DESCRIPTION} from 'pages/settings/new_billing/constants'

describe('PlanSubscriptionDescription', () => {
    const setSelectedPriceMock = jest.fn()
    const setIsSubscriptionEnabledMock = jest.fn()

    const props = {
        productType: ProductType.Convert,
        prices: convertProduct.prices,
        tagline: '',
        isStarterPlan: false,
        isTrialing: false,
        isEnterprisePlan: false,
        selectedPrice: convertProduct.prices[1],
        setSelectedPrice: setSelectedPriceMock,
        setIsSubscriptionEnabled: setIsSubscriptionEnabledMock,
    } as PlanSubscriptionDescriptionProps

    it('should render correctly', () => {
        const {getByText} = render(
            <Provider store={mockStore({} as any)}>
                <PlanSubscriptionDescription {...props} />
            </Provider>
        )

        expect(
            getByText('Ready to upgrade with Convert', {exact: false})
        ).toBeInTheDocument()
        expect(getByText('$1/month', {exact: false})).toBeInTheDocument()
        expect(getByText('clicks/month')).toBeInTheDocument()

        PRODUCT_SUBSCRIPTION_DESCRIPTION[ProductType.Convert].features?.forEach(
            (feature) => {
                expect(getByText(feature)).toBeInTheDocument()
            }
        )
    })

    it('should render correctly for starter plan', () => {
        const {getByText} = render(
            <Provider store={mockStore({} as any)}>
                <PlanSubscriptionDescription {...props} isStarterPlan={true} />
            </Provider>
        )

        expect(
            getByText(
                "You're on a Starter plan. Upgrade your Helpdesk subscription to unlock Convert."
            )
        ).toBeInTheDocument()

        PRODUCT_SUBSCRIPTION_DESCRIPTION[ProductType.Convert].features?.forEach(
            (feature) => {
                expect(getByText(feature)).toBeInTheDocument()
            }
        )
    })

    it('should render correctly for enterprise plan', () => {
        const {getByText} = render(
            <Provider store={mockStore({} as any)}>
                <PlanSubscriptionDescription
                    {...props}
                    isEnterprisePlan={true}
                />
            </Provider>
        )

        expect(
            getByText('Contact our team to subscribe to an Enterprise plan.')
        ).toBeInTheDocument()

        PRODUCT_SUBSCRIPTION_DESCRIPTION[ProductType.Convert].features?.forEach(
            (feature) => {
                expect(getByText(feature)).toBeInTheDocument()
            }
        )
    })
})
