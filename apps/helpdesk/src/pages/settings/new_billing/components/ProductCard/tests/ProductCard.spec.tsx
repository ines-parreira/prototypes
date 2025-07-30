import { act, render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {
    basicMonthlyHelpdeskPlan,
    basicYearlyAutomationPlan,
    convertPlan0,
    HELPDESK_PRODUCT_ID,
    products,
    smsPlan1,
    voicePlan0,
} from 'fixtures/productPrices'
import { ProductType } from 'models/billing/types'
import { RootState, StoreDispatch } from 'state/types'

import { PRODUCT_INFO } from '../../../constants'
import ProductCard, { ProductCardProps } from '../ProductCard'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const store = mockedStore({
    billing: fromJS({
        currentAccount: fromJS({
            current_subscription: {
                products: {
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.price_id,
                },
            },
        }),
        products,
    }),
})

describe('ProductCard', () => {
    it('should render a Helpdesk ProductCard component', () => {
        const { container } = render(
            <Provider store={store}>
                <ProductCard
                    type={ProductType.Helpdesk}
                    plan={basicMonthlyHelpdeskPlan}
                    isDisabled={false}
                />
            </Provider>,
        )
        expect(container).toMatchSnapshot()
    })

    it('should render an active ProductCard component', () => {
        render(
            <Provider store={store}>
                <ProductCard
                    type={ProductType.Automation}
                    plan={basicYearlyAutomationPlan}
                    isDisabled={false}
                />
            </Provider>,
        )
        expect(screen.getByText('Active')).toBeInTheDocument()
        expect(screen.getByText('Manage')).toBeInTheDocument()
    })

    it('should render an inactive ProductCard component', () => {
        render(
            <Provider store={store}>
                <ProductCard type={ProductType.Automation} isDisabled={false} />
            </Provider>,
        )

        expect(screen.getByText('Inactive')).toBeInTheDocument()
        expect(screen.getByText('Subscribe')).toBeInTheDocument()
    })

    it('should render a disabled ProductCard component', () => {
        render(
            <Provider store={store}>
                <ProductCard type={ProductType.Automation} isDisabled={true} />
            </Provider>,
        )

        expect(
            screen.getByRole('button', {
                name: 'lock Subscribe',
            }),
        ).toBeAriaDisabled()
    })

    it.each(Object.values(ProductType))(
        'should render a tooltip on an active ProductCard component for %p',
        async (productType: ProductType) => {
            const plans = {
                [ProductType.Helpdesk]: basicMonthlyHelpdeskPlan,
                [ProductType.Automation]: basicYearlyAutomationPlan,
                [ProductType.Voice]: voicePlan0,
                [ProductType.SMS]: smsPlan1,
                [ProductType.Convert]: convertPlan0,
            }
            const props: ProductCardProps = {
                type: productType,
                plan: plans[productType],
                isDisabled: false,
            }

            const user = userEvent.setup()
            const { container } = render(
                <Provider store={store}>
                    <ProductCard {...props} />
                </Provider>,
            )
            expect(screen.getByText('Active')).toBeInTheDocument()
            expect(screen.getByText('Manage')).toBeInTheDocument()

            const productInfo = PRODUCT_INFO[productType]
            const infoIcon = container.querySelector(`#info_${productType}`)
            await act(async () => {
                await user.hover(infoIcon!)
            })

            const tooltip = screen.getByText(productInfo.tooltip)
            expect(tooltip).toBeInTheDocument()

            const tooltipContainer = screen.getByRole('tooltip')
            expect(tooltipContainer).toBeInTheDocument()

            const link = within(tooltipContainer!).getByText('Learn more')
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute('href', productInfo.tooltipLink)

            expect(tooltip).toHaveAttribute(
                'data-candu-id',
                `product-card-${productType}-tooltip`,
            )
        },
    )
})
