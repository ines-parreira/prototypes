import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { convertProduct } from 'fixtures/productPrices'
import { ProductType } from 'models/billing/types'
import { getProductLabel } from 'models/billing/utils'
import PlanSubscriptionDescription, {
    PlanSubscriptionDescriptionProps,
} from 'pages/settings/new_billing/components/SubscriptionModal/PlanSubscriptionDescription'
import {
    PRODUCT_INFO,
    PRODUCT_SUBSCRIPTION_DESCRIPTION,
} from 'pages/settings/new_billing/constants'
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

    it('should render correctly for enterprise plan', async () => {
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

        await userEvent.click(selectedPlan)

        const items = screen.getAllByRole('menuitem')

        const label = getProductLabel(availablePlans[0]) as string
        expect(label).toEqual('Pay as you go')
        expect(items[0]).toHaveTextContent(label)

        await userEvent.click(items[0])
        expect(setSelectedPlanMock).toHaveBeenCalledWith(availablePlans[0])
    })

    it.each(Object.values(ProductType))(
        'should render a tooltip for %p',
        async (productType: ProductType) => {
            const testProps: PlanSubscriptionDescriptionProps = {
                ...props,
                productType,
            }
            const user = userEvent.setup()
            const { container } = renderWithStoreAndQueryClientProvider(
                <PlanSubscriptionDescription {...testProps} />,
            )

            const productInfo = PRODUCT_INFO[productType]
            expect(
                screen.getByText(`Ready to upgrade with ${productInfo.title}`, {
                    exact: false,
                }),
            ).toBeInTheDocument()

            const infoIcon = container.querySelector('#priceSelectInfo')
            await act(async () => {
                await user.hover(infoIcon!)
            })

            const tooltip = screen.getByText(productInfo.tooltip)
            expect(tooltip).toBeInTheDocument()

            expect(tooltip).toHaveAttribute(
                'data-candu-id',
                'plan-subscription-tooltip',
            )
        },
    )
})
