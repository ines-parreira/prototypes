import { PRODUCT_SUBSCRIPTION_DESCRIPTION } from '@repo/billing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { convertProduct } from 'fixtures/plans'
import { Cadence, ProductType } from 'models/billing/types'
import { getProductInfo, getProductLabel } from 'models/billing/utils'
import type { PlanSubscriptionDescriptionProps } from 'pages/settings/new_billing/components/SubscriptionModal/PlanSubscriptionDescription'
import PlanSubscriptionDescription from 'pages/settings/new_billing/components/SubscriptionModal/PlanSubscriptionDescription'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

describe('PlanSubscriptionDescription', () => {
    const setSelectedPlanMock = jest.fn()
    const setIsSubscriptionEnabledMock = jest.fn()

    const availablePlans = convertProduct.prices

    // Find first non-trial plan (amount > 0) for testing
    const currentSelectedPlan = convertProduct.prices.find(
        (plan) => plan.amount > 0 && plan.cadence === Cadence.Month,
    )!

    const props = {
        productType: ProductType.Convert,
        availablePlans,
        tagline: '',
        isTrialing: false,
        isEnterprisePlan: false,
        selectedPlan: currentSelectedPlan,
        setSelectedPlan: setSelectedPlanMock,
        setIsSubscriptionEnabled: setIsSubscriptionEnabledMock,
        trackingSource: 'test',
        isYearlyPlan: false,
    } as PlanSubscriptionDescriptionProps

    it('should render correctly', () => {
        renderWithStoreAndQueryClientProvider(
            <PlanSubscriptionDescription {...props} />,
        )

        expect(
            screen.getByText('Ready to upgrade with Convert', { exact: false }),
        ).toBeInTheDocument()

        expect(
            screen.getByText(`$30/${Cadence.Month}`, { exact: false }),
        ).toBeInTheDocument()

        expect(screen.getByText(`clicks/${Cadence.Month}`)).toBeInTheDocument()

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

            const productInfo = getProductInfo(productType, props.selectedPlan)
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
        },
    )

    it('should render correctly for yearly plan', () => {
        renderWithStoreAndQueryClientProvider(
            <PlanSubscriptionDescription {...props} isYearlyPlan={true} />,
        )

        expect(
            screen.getByText('Contact our team to subscribe to a custom plan.'),
        ).toBeInTheDocument()

        PRODUCT_SUBSCRIPTION_DESCRIPTION[ProductType.Convert].features?.forEach(
            (feature) => {
                expect(screen.getByText(feature)).toBeInTheDocument()
            },
        )

        expect(screen.queryByLabelText('Plan')).not.toBeInTheDocument()
        expect(
            screen.queryByText(`$30/${Cadence.Month}`, { exact: false }),
        ).not.toBeInTheDocument()
    })
})
