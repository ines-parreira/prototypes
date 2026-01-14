import { logEvent, SegmentEvent } from '@repo/logging'
import { act, render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { useHistory } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import {
    basicMonthlyHelpdeskPlan,
    basicYearlyAutomationPlan,
    convertPlan0,
    HELPDESK_PRODUCT_ID,
    products,
    smsPlan1,
    voicePlan0,
} from 'fixtures/plans'
import { ProductType } from 'models/billing/types'
import { getProductInfo } from 'models/billing/utils'
import type { RootState, StoreDispatch } from 'state/types'

import type { ProductCardProps } from '../ProductCard'
import ProductCard from '../ProductCard'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
}))

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
    SegmentEvent: jest.requireActual('@repo/logging').SegmentEvent,
}))

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const store = mockedStore({
    billing: fromJS({
        currentAccount: fromJS({
            current_subscription: {
                products: {
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                },
            },
        }),
        products,
    }),
})

const mockPush = jest.fn()
const mockUseHistory = useHistory as jest.Mock
const mockLogEvent = logEvent as jest.Mock

describe('ProductCard', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseHistory.mockReturnValue({
            push: mockPush,
        })
        mockLogEvent.mockImplementation(() => {})
    })

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

    describe('Tracking events', () => {
        it('should log BillingUsageAndPlansManageProductClicked event when clicking Manage button', async () => {
            render(
                <Provider store={store}>
                    <ProductCard
                        type={ProductType.Automation}
                        plan={basicYearlyAutomationPlan}
                        isDisabled={false}
                    />
                </Provider>,
            )

            const manageButton = screen.getByRole('button', { name: /manage/i })
            await act(() => userEvent.click(manageButton))

            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansManageProductClicked,
                {
                    url: `/app/settings/billing/process/${ProductType.Automation}`,
                },
            )
            expect(mockPush).toHaveBeenCalledWith(
                `/app/settings/billing/process/${ProductType.Automation}`,
            )
        })

        it('should log BillingUsageAndPlansSubscribeProductClicked event when clicking Subscribe button', async () => {
            render(
                <Provider store={store}>
                    <ProductCard
                        type={ProductType.Automation}
                        isDisabled={false}
                    />
                </Provider>,
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
            expect(mockPush).toHaveBeenCalledWith(
                `/app/settings/billing/process/${ProductType.Automation}`,
            )
        })

        it('should log correct URL for different product types when clicking Manage', async () => {
            render(
                <Provider store={store}>
                    <ProductCard
                        type={ProductType.Voice}
                        plan={voicePlan0}
                        isDisabled={false}
                    />
                </Provider>,
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
                <Provider store={store}>
                    <ProductCard type={ProductType.SMS} isDisabled={false} />
                </Provider>,
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
                <Provider store={store}>
                    <ProductCard
                        type={ProductType.Automation}
                        plan={basicYearlyAutomationPlan}
                        isDisabled={false}
                        scheduledToCancelAt={null}
                    />
                </Provider>,
            )

            expect(screen.getByText('Active')).toBeInTheDocument()
            expect(screen.queryByText(/Active until/i)).not.toBeInTheDocument()
        })

        it('should show "Active until <date>" warning badge when product has cancellation scheduled', () => {
            const cancellationDate = '2025-12-31T23:59:59Z'

            render(
                <Provider store={store}>
                    <ProductCard
                        type={ProductType.Automation}
                        plan={basicYearlyAutomationPlan}
                        isDisabled={false}
                        scheduledToCancelAt={cancellationDate}
                    />
                </Provider>,
            )

            expect(screen.queryByText('Active')).not.toBeInTheDocument()
            expect(
                screen.getByText(/Active until December 31, 2025/i),
            ).toBeInTheDocument()
        })

        it('should show "Inactive" badge when product has no plan, regardless of cancellation', () => {
            const cancellationDate = '2025-12-31T23:59:59Z'

            render(
                <Provider store={store}>
                    <ProductCard
                        type={ProductType.Automation}
                        plan={null}
                        isDisabled={false}
                        scheduledToCancelAt={cancellationDate}
                    />
                </Provider>,
            )

            expect(screen.getByText('Inactive')).toBeInTheDocument()
            expect(screen.queryByText(/Active until/i)).not.toBeInTheDocument()
        })

        it('should format cancellation date correctly', () => {
            const cancellationDate = '2026-01-15T12:00:00Z'

            render(
                <Provider store={store}>
                    <ProductCard
                        type={ProductType.Voice}
                        plan={voicePlan0}
                        isDisabled={false}
                        scheduledToCancelAt={cancellationDate}
                    />
                </Provider>,
            )

            expect(
                screen.getByText(/Active until January 15, 2026/i),
            ).toBeInTheDocument()
        })

        it('should show "Active" badge when scheduledToCancelAt is undefined', () => {
            render(
                <Provider store={store}>
                    <ProductCard
                        type={ProductType.Convert}
                        plan={convertPlan0}
                        isDisabled={false}
                    />
                </Provider>,
            )

            expect(screen.getByText('Active')).toBeInTheDocument()
            expect(screen.queryByText(/Active until/i)).not.toBeInTheDocument()
        })
    })
})
