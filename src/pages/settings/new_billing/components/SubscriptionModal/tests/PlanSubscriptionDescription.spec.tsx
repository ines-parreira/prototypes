import React from 'react'

import { screen } from '@testing-library/react'

import { convertProduct } from 'fixtures/productPrices'
import { ProductType } from 'models/billing/types'
import { getProductLabel } from 'models/billing/utils'
import PlanSubscriptionDescription, {
    PlanSubscriptionDescriptionProps,
} from 'pages/settings/new_billing/components/SubscriptionModal/PlanSubscriptionDescription'
import { PRODUCT_SUBSCRIPTION_DESCRIPTION } from 'pages/settings/new_billing/constants'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

describe('PlanSubscriptionDescription', () => {
    const setSelectedPlanMock = jest.fn()
    const setIsSubscriptionEnabledMock = jest.fn()

    const availablePlans = convertProduct.prices

    const currentSelectedPlan = convertProduct.prices[1]

    const props = {
        productType: ProductType.Convert,
        availablePlans,
        tagline: '',
        isTrialing: false,
        isEnterprisePlan: false,
        selectedPlan: currentSelectedPlan,
        setSelectedPlan: setSelectedPlanMock,
        setIsSubscriptionEnabled: setIsSubscriptionEnabledMock,
    } as PlanSubscriptionDescriptionProps

    it('should render correctly', () => {
        renderWithStoreAndQueryClientProvider(
            <PlanSubscriptionDescription {...props} />,
        )

        expect(
            screen.getByText('Ready to upgrade with Convert', { exact: false }),
        ).toBeInTheDocument()

        expect(
            screen.getByText('$30/month', { exact: false }),
        ).toBeInTheDocument()

        expect(screen.getByText('clicks/month')).toBeInTheDocument()

        PRODUCT_SUBSCRIPTION_DESCRIPTION[ProductType.Convert].features?.forEach(
            (feature) => {
                expect(screen.getByText(feature)).toBeInTheDocument()
            },
        )
    })

    it('should render correctly for enterprise plan', () => {
        renderWithStoreAndQueryClientProvider(
            <PlanSubscriptionDescription {...props} isEnterprisePlan={true} />,
        )

        expect(
            screen.getByText(
                'Contact our team to subscribe to an Enterprise plan.',
            ),
        ).toBeInTheDocument()

        PRODUCT_SUBSCRIPTION_DESCRIPTION[ProductType.Convert].features?.forEach(
            (feature) => {
                expect(screen.getByText(feature)).toBeInTheDocument()
            },
        )

        const selectedPlan = screen.getByLabelText('Plan')
        expect(selectedPlan).toHaveTextContent(
            currentSelectedPlan.num_quota_tickets.toString(),
        )

        selectedPlan.click()

        const items = screen.getAllByRole('menuitem')

        const label = getProductLabel(availablePlans[0]) as string
        expect(label).toEqual('Pay as you go')
        expect(items[0]).toHaveTextContent(label)

        items[0].click()
        expect(setSelectedPlanMock).toHaveBeenCalledWith(availablePlans[0])
    })
})
