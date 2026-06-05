import { logEvent, SegmentEvent } from '@repo/logging'
import { render as testingRender } from '@repo/testing'
import { act, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { useLocation } from 'react-router-dom'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    basicYearlyAutomationPlan,
    basicYearlyInvoicedMonthlyAutomationPlan,
    basicYearlyInvoicedMonthlyHelpdeskPlan,
    convertPlan0,
    HELPDESK_PRODUCT_ID,
    products,
    smsPlan1,
    voicePlan0,
} from 'fixtures/plans'
import { ProductType } from 'models/billing/types'
import { getProductInfo } from 'models/billing/utils'

import type { ProductCardProps } from '../ProductCard'
import ProductCard from '../ProductCard'

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
    SegmentEvent: jest.requireActual('@repo/logging').SegmentEvent,
}))
const LocationPath = () => {
    const location = useLocation()

    return <output aria-label="Current path">{location.pathname}</output>
}
const defaultStore = {
    billing: fromJS(billingState),
    currentAccount: fromJS(account),
}
const render = (
    ui: Parameters<typeof testingRender>[0],
    options?: Parameters<typeof testingRender>[1],
) =>
    testingRender(ui, {
        ...options,
        storeState: options?.storeState ?? defaultStore,
    })
const renderWithLocation = (
    ui: Parameters<typeof testingRender>[0],
    options?: Parameters<typeof testingRender>[1],
) =>
    testingRender(
        <>
            {ui}
            <LocationPath />
        </>,
        {
            ...options,
            storeState: options?.storeState ?? defaultStore,
        },
    )
const mockLogEvent = logEvent as jest.Mock
describe('ProductCard', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockLogEvent.mockImplementation(() => {})
    })
    it('should render a Helpdesk ProductCard component', () => {
        const { container } = render(
            <ProductCard
                type={ProductType.Helpdesk}
                plan={basicMonthlyHelpdeskPlan}
                isDisabled={false}
                tooltipDisabledCTACallback={jest.fn()}
            />,
            {},
        )
        expect(container).toMatchSnapshot()
    })
    it('should render an active ProductCard component', () => {
        render(
            <ProductCard
                type={ProductType.Automation}
                plan={basicYearlyAutomationPlan}
                isDisabled={false}
                tooltipDisabledCTACallback={jest.fn()}
            />,
            {},
        )
        expect(screen.getByText('Active')).toBeInTheDocument()
        expect(screen.getByText('Manage')).toBeInTheDocument()
    })
    it('should render an inactive ProductCard component', () => {
        render(
            <ProductCard
                type={ProductType.Automation}
                isDisabled={false}
                tooltipDisabledCTACallback={jest.fn()}
                plan={undefined}
            />,
            {},
        )
        expect(screen.getByText('Inactive')).toBeInTheDocument()
        expect(screen.getByText('Subscribe')).toBeInTheDocument()
    })
    it('should render a disabled ProductCard component', () => {
        render(
            <ProductCard
                type={ProductType.Automation}
                isDisabled={true}
                tooltipDisabledCTACallback={jest.fn()}
                plan={undefined}
            />,
            {},
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
                tooltipDisabledCTACallback: jest.fn(),
            }
            const user = userEvent.setup()
            const { container } = render(<ProductCard {...props} />, {})
            expect(screen.getByText('Active')).toBeInTheDocument()
            expect(screen.getByText('Manage')).toBeInTheDocument()
            const productInfo = getProductInfo(productType, plans[productType])
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
        },
    )
    describe('Separate invoice cadence plan behavior', () => {
        const separateInvoiceCadenceProducts = products.map((product) => {
            if (product.type === ProductType.Helpdesk) {
                return {
                    ...product,
                    prices: [
                        ...product.prices,
                        basicYearlyInvoicedMonthlyHelpdeskPlan,
                    ],
                }
            }
            return product
        })
        it('should disable Manage button for separate invoice cadence plans', () => {
            render(
                <ProductCard
                    type={ProductType.Automation}
                    plan={basicYearlyInvoicedMonthlyAutomationPlan}
                    isDisabled={false}
                    tooltipDisabledCTACallback={jest.fn()}
                />,
                {
                    storeState: {
                        billing: fromJS({
                            ...billingState,
                            products: separateInvoiceCadenceProducts,
                        }),
                        currentAccount: fromJS({
                            ...account,
                            current_subscription: {
                                ...account.current_subscription,
                                products: {
                                    [HELPDESK_PRODUCT_ID]:
                                        basicYearlyInvoicedMonthlyHelpdeskPlan.plan_id,
                                    [AUTOMATION_PRODUCT_ID]:
                                        basicYearlyInvoicedMonthlyAutomationPlan.plan_id,
                                },
                            },
                        }),
                    },
                },
            )
            expect(
                screen.getByRole('button', { name: /manage/i }),
            ).toBeAriaDisabled()
        })
        it('should disable Subscribe button for separate invoice cadence plans without active plan', () => {
            render(
                <ProductCard
                    type={ProductType.Automation}
                    isDisabled={false}
                    tooltipDisabledCTACallback={jest.fn()}
                    plan={undefined}
                />,
                {
                    storeState: {
                        billing: fromJS({
                            ...billingState,
                            products: separateInvoiceCadenceProducts,
                        }),
                        currentAccount: fromJS({
                            ...account,
                            current_subscription: {
                                ...account.current_subscription,
                                products: {
                                    [HELPDESK_PRODUCT_ID]:
                                        basicYearlyInvoicedMonthlyHelpdeskPlan.plan_id,
                                },
                            },
                        }),
                    },
                },
            )
            expect(
                screen.getByRole('button', { name: /subscribe/i }),
            ).toBeAriaDisabled()
        })
        it('should hide "Starting at" pricing for separate invoice cadence plans when product is inactive', () => {
            render(
                <ProductCard
                    type={ProductType.Automation}
                    isDisabled={false}
                    tooltipDisabledCTACallback={jest.fn()}
                    plan={undefined}
                />,
                {
                    storeState: {
                        billing: fromJS({
                            ...billingState,
                            products: separateInvoiceCadenceProducts,
                        }),
                        currentAccount: fromJS({
                            ...account,
                            current_subscription: {
                                ...account.current_subscription,
                                products: {
                                    [HELPDESK_PRODUCT_ID]:
                                        basicYearlyInvoicedMonthlyHelpdeskPlan.plan_id,
                                },
                            },
                        }),
                    },
                },
            )
            expect(screen.queryByText(/starting at/i)).not.toBeInTheDocument()
        })
        it('should show "Starting at" pricing for non-yearly plans when product is inactive', () => {
            render(
                <ProductCard
                    type={ProductType.Automation}
                    isDisabled={false}
                    tooltipDisabledCTACallback={jest.fn()}
                    plan={undefined}
                />,
                {
                    storeState: {
                        billing: fromJS(billingState),
                        currentAccount: fromJS(account),
                    },
                },
            )
            expect(screen.getByText(/starting at/i)).toBeInTheDocument()
        })
        it('should not disable Manage button when cadence matches invoice_cadence', () => {
            renderWithLocation(
                <ProductCard
                    type={ProductType.Automation}
                    plan={basicMonthlyAutomationPlan}
                    isDisabled={false}
                    tooltipDisabledCTACallback={jest.fn()}
                />,
                {
                    storeState: {
                        billing: fromJS(billingState),
                        currentAccount: fromJS(account),
                    },
                },
            )
            expect(
                screen.getByRole('button', { name: /manage/i }),
            ).not.toBeAriaDisabled()
        })
        it('should show contact us tooltip for separate invoice cadence plans', async () => {
            const separateInvoiceCadenceProducts = products.map((product) => {
                if (product.type === ProductType.Helpdesk) {
                    return {
                        ...product,
                        prices: [
                            ...product.prices,
                            basicYearlyInvoicedMonthlyHelpdeskPlan,
                        ],
                    }
                }
                return product
            })
            render(
                <ProductCard
                    type={ProductType.Automation}
                    plan={basicYearlyInvoicedMonthlyAutomationPlan}
                    isDisabled={false}
                    tooltipDisabledCTACallback={jest.fn()}
                />,
                {
                    storeState: {
                        billing: fromJS({
                            ...billingState,
                            products: separateInvoiceCadenceProducts,
                        }),
                        currentAccount: fromJS({
                            ...account,
                            current_subscription: {
                                ...account.current_subscription,
                                products: {
                                    [HELPDESK_PRODUCT_ID]:
                                        basicYearlyInvoicedMonthlyHelpdeskPlan.plan_id,
                                },
                            },
                        }),
                    },
                },
            )
            const manageButton = screen.getByRole('button', { name: /manage/i })
            const user = userEvent.setup()
            await act(async () => {
                await user.hover(manageButton)
            })
            expect(screen.getByText(/contact our team/i)).toBeInTheDocument()
        })
    })
    describe('Tracking events', () => {
        it('should log BillingUsageAndPlansManageProductClicked event when clicking Manage button', async () => {
            renderWithLocation(
                <ProductCard
                    type={ProductType.Automation}
                    plan={basicMonthlyAutomationPlan}
                    isDisabled={false}
                    tooltipDisabledCTACallback={jest.fn()}
                />,
                {},
            )
            const manageButton = screen.getByRole('button', { name: /manage/i })
            await act(() => userEvent.click(manageButton))
            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansManageProductClicked,
                {
                    url: `/app/settings/billing/process/${ProductType.Automation}`,
                },
            )
            expect(screen.getByLabelText('Current path')).toHaveTextContent(
                `/app/settings/billing/process/${ProductType.Automation}`,
            )
        })
        it('should log BillingUsageAndPlansSubscribeProductClicked event when clicking Subscribe button', async () => {
            renderWithLocation(
                <ProductCard
                    type={ProductType.Automation}
                    isDisabled={false}
                    tooltipDisabledCTACallback={jest.fn()}
                    plan={undefined}
                />,
                {},
            )
            const subscribeButton = screen.getByRole('button', {
                name: /subscribe/i,
            })
            await act(() => userEvent.click(subscribeButton))
            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansSubscribeProductClicked,
                {
                    url: `/app/settings/billing/process/${ProductType.Automation}`,
                },
            )
            expect(screen.getByLabelText('Current path')).toHaveTextContent(
                `/app/settings/billing/process/${ProductType.Automation}`,
            )
        })
        it('should log correct URL for different product types when clicking Manage', async () => {
            render(
                <ProductCard
                    type={ProductType.Voice}
                    plan={voicePlan0}
                    isDisabled={false}
                    tooltipDisabledCTACallback={jest.fn()}
                />,
                {},
            )
            const manageButton = screen.getByRole('button', { name: /manage/i })
            await act(() => userEvent.click(manageButton))
            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansManageProductClicked,
                {
                    url: `/app/settings/billing/process/${ProductType.Voice}`,
                },
            )
        })
        it('should log correct URL for different product types when clicking Subscribe', async () => {
            render(
                <ProductCard
                    type={ProductType.SMS}
                    isDisabled={false}
                    tooltipDisabledCTACallback={jest.fn()}
                    plan={undefined}
                />,
                {},
            )
            const subscribeButton = screen.getByRole('button', {
                name: /subscribe/i,
            })
            await act(() => userEvent.click(subscribeButton))
            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansSubscribeProductClicked,
                {
                    url: `/app/settings/billing/process/${ProductType.SMS}`,
                },
            )
        })
    })
    describe('Product cancellation badge', () => {
        it('should show "Active" badge when product is active without cancellation', () => {
            render(
                <ProductCard
                    type={ProductType.Automation}
                    plan={basicYearlyAutomationPlan}
                    isDisabled={false}
                    scheduledToCancelAt={null}
                    tooltipDisabledCTACallback={jest.fn()}
                />,
                {},
            )
            expect(screen.getByText('Active')).toBeInTheDocument()
            expect(screen.queryByText(/Active until/i)).not.toBeInTheDocument()
        })
        it('should show Active until <date> warning badge when product has cancellation scheduled', () => {
            const cancellationDate = '2025-12-31T23:59:59Z'
            render(
                <ProductCard
                    type={ProductType.Automation}
                    plan={basicYearlyAutomationPlan}
                    isDisabled={false}
                    scheduledToCancelAt={cancellationDate}
                    tooltipDisabledCTACallback={jest.fn()}
                />,
                {},
            )
            expect(screen.queryByText('Active')).not.toBeInTheDocument()
            expect(
                screen.getByText(/Active until December 31, 2025/i),
            ).toBeInTheDocument()
        })
        it('should show "Inactive" badge when product has no plan, regardless of cancellation', () => {
            const cancellationDate = '2025-12-31T23:59:59Z'
            render(
                <ProductCard
                    type={ProductType.Automation}
                    plan={undefined}
                    isDisabled={false}
                    scheduledToCancelAt={cancellationDate}
                    tooltipDisabledCTACallback={jest.fn()}
                />,
                {},
            )
            expect(screen.getByText('Inactive')).toBeInTheDocument()
            expect(screen.queryByText(/Active until/i)).not.toBeInTheDocument()
        })
        it('should format cancellation date correctly', () => {
            const cancellationDate = '2026-01-15T12:00:00Z'
            render(
                <ProductCard
                    type={ProductType.Voice}
                    plan={voicePlan0}
                    isDisabled={false}
                    scheduledToCancelAt={cancellationDate}
                    tooltipDisabledCTACallback={jest.fn()}
                />,
                {},
            )
            expect(
                screen.getByText(/Active until January 15, 2026/i),
            ).toBeInTheDocument()
        })
        it('should show "Active" badge when scheduledToCancelAt is undefined', () => {
            render(
                <ProductCard
                    type={ProductType.Convert}
                    plan={convertPlan0}
                    isDisabled={false}
                    tooltipDisabledCTACallback={jest.fn()}
                />,
                {},
            )
            expect(screen.getByText('Active')).toBeInTheDocument()
            expect(screen.queryByText(/Active until/i)).not.toBeInTheDocument()
        })
    })
    describe('Loading state', () => {
        it('should render nothing for badge when isLoading is true for active product', () => {
            render(
                <ProductCard
                    type={ProductType.Automation}
                    plan={basicYearlyAutomationPlan}
                    isDisabled={false}
                    isLoading={true}
                    tooltipDisabledCTACallback={jest.fn()}
                />,
                {},
            )
            expect(screen.queryByText('Active')).not.toBeInTheDocument()
            expect(screen.queryByText('Inactive')).not.toBeInTheDocument()
        })
        it('should render nothing for badge when isLoading is true for inactive product', () => {
            render(
                <ProductCard
                    type={ProductType.Automation}
                    plan={undefined}
                    isDisabled={false}
                    isLoading={true}
                    tooltipDisabledCTACallback={jest.fn()}
                />,
                {},
            )
            expect(screen.queryByText('Active')).not.toBeInTheDocument()
            expect(screen.queryByText('Inactive')).not.toBeInTheDocument()
        })
        it('should render nothing for badge when isLoading is true with scheduled cancellation', () => {
            const cancellationDate = '2025-12-31T23:59:59Z'
            render(
                <ProductCard
                    type={ProductType.Automation}
                    plan={basicYearlyAutomationPlan}
                    isDisabled={false}
                    scheduledToCancelAt={cancellationDate}
                    isLoading={true}
                    tooltipDisabledCTACallback={jest.fn()}
                />,
                {},
            )
            expect(screen.queryByText('Active')).not.toBeInTheDocument()
            expect(screen.queryByText(/Active until/i)).not.toBeInTheDocument()
            expect(screen.queryByText('Inactive')).not.toBeInTheDocument()
        })
        it('should render badge when isLoading is false', () => {
            render(
                <ProductCard
                    type={ProductType.Automation}
                    plan={basicYearlyAutomationPlan}
                    isDisabled={false}
                    isLoading={false}
                    tooltipDisabledCTACallback={jest.fn()}
                />,
                {},
            )
            expect(screen.getByText('Active')).toBeInTheDocument()
        })
        it('should render badge when isLoading is undefined (defaults to false)', () => {
            render(
                <ProductCard
                    type={ProductType.Automation}
                    plan={basicYearlyAutomationPlan}
                    isDisabled={false}
                    tooltipDisabledCTACallback={jest.fn()}
                />,
                {},
            )
            expect(screen.getByText('Active')).toBeInTheDocument()
        })
    })
})
