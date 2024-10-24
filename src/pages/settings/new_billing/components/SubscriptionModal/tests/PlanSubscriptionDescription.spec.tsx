import {render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'

import {convertProduct} from 'fixtures/productPrices'
import {ProductType} from 'models/billing/types'
import PlanSubscriptionDescription, {
    PlanSubscriptionDescriptionProps,
} from 'pages/settings/new_billing/components/SubscriptionModal/PlanSubscriptionDescription'
import {PRODUCT_SUBSCRIPTION_DESCRIPTION} from 'pages/settings/new_billing/constants'
import {mockStore} from 'utils/testing'

describe('PlanSubscriptionDescription', () => {
    const setSelectedPriceMock = jest.fn()
    const setIsSubscriptionEnabledMock = jest.fn()

    const props = {
        productType: ProductType.Convert,
        availablePlans: convertProduct.prices,
        tagline: '',
        isTrialing: false,
        isEnterprisePlan: false,
        selectedPlan: convertProduct.prices[1],
        setSelectedPlan: setSelectedPriceMock,
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
        expect(getByText('$30/month', {exact: false})).toBeInTheDocument()
        expect(getByText('clicks/month')).toBeInTheDocument()

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
