import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import * as uiKit from '@gorgias/ui-kit'

import {QueryClientProvider} from '@tanstack/react-query'
import {RootState, StoreDispatch} from 'state/types'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyHelpdeskPlan,
    CONVERT_PRODUCT_ID,
    convertPlan1,
    currentProductsUsage,
    HELPDESK_PRODUCT_ID,
    helpdeskProduct,
    legacyBasicAutomatePlan,
    products,
    SMS_PRODUCT_ID,
    smsPlan1,
    starterHelpdeskPlan,
} from 'fixtures/productPrices'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {account} from 'fixtures/account'
import {assumeMock} from 'utils/testing'
import {ProductType} from 'models/billing/types'
import {AlertType} from 'pages/common/components/Alert/Alert'
import ProductCard from 'pages/settings/new_billing/components/ProductCard'
import {ProductCardProps} from 'pages/settings/new_billing/components/ProductCard/ProductCard'
import UsageAndPlansView from 'pages/settings/new_billing/views/UsageAndPlansView/UsageAndPlansView'

// Mock ui-kit as an ES module to enable spying
jest.mock('@gorgias/ui-kit', () => {
    return {
        __esModule: true,
        ...jest.requireActual('@gorgias/ui-kit'),
    } as Record<string, unknown>
})

jest.mock('pages/settings/new_billing/components/ProductCard', () =>
    jest.fn((props: ProductCardProps) => {
        const dataTestId = `product-card--${props.type}`
        return <div data-testid={dataTestId}></div>
    })
)
const ProductCardMock = assumeMock(ProductCard)

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const queryClient = mockQueryClient()

const mockedUsage = {
    [ProductType.Helpdesk]: currentProductsUsage[ProductType.Helpdesk],
    [ProductType.Automation]: null,
    [ProductType.Voice]: null,
    [ProductType.SMS]: null,
    [ProductType.Convert]: currentProductsUsage[ProductType.Convert],
}
const mockedBilling = {
    invoices: [],
    products,
    currentProductsUsage: mockedUsage,
}

const mockedAccount = {
    ...account,
    current_subscription: {
        ...account.current_subscription,
        products: {
            [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.price_id,
            [CONVERT_PRODUCT_ID]: convertPlan1.price_id,
        },
        status: 'active',
    },
}
const store = mockedStore({
    billing: fromJS(mockedBilling),
    currentAccount: fromJS(mockedAccount),
})

describe('UsageAndPlansView', () => {
    const MockTooltip = jest.spyOn(uiKit, 'Tooltip')
    it('should render with active subscription containing Helpdesk and Convert products', () => {
        const helpdeskBanner = {
            description: 'Helpdesk banner',
            type: AlertType.Info,
        }
        const convertBanner = {
            description: 'Convert banner',
            type: AlertType.Info,
        }

        const {getByText} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <UsageAndPlansView
                        contactBilling={jest.fn()}
                        periodEnd="2021-01-01"
                        currentUsage={mockedUsage}
                        helpdeskBanner={helpdeskBanner}
                        convertBanner={convertBanner}
                    />
                </Provider>
            </QueryClientProvider>
        )
        expect(ProductCardMock).toHaveBeenCalledTimes(5)
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            1,
            {
                type: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                usage: mockedUsage[ProductType.Helpdesk],
                banner: helpdeskBanner,
                isDisabled: false,
            },
            {}
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            2,
            {
                type: ProductType.Automation,
                plan: undefined,
                usage: null,
                isDisabled: false,
            },
            {}
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            3,
            {
                type: ProductType.Voice,
                plan: undefined,
                usage: null,
                isDisabled: false,
            },
            {}
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            4,
            {
                type: ProductType.SMS,
                plan: undefined,
                usage: null,
                isDisabled: false,
            },
            {}
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            5,
            {
                type: ProductType.Convert,
                plan: convertPlan1,
                usage: mockedUsage[ProductType.Convert],
                banner: convertBanner,
                isDisabled: false,
                autoUpgradeEnabled: false,
            },
            {}
        )

        expect(getByText('Update')).toHaveAttribute(
            'to',
            '/app/settings/billing/payment/frequency'
        )
    })

    it('should render with scheduled cancellation including Helpdesk and Convert products', () => {
        const alteredStore = mockedStore({
            billing: fromJS(mockedBilling),
            currentAccount: fromJS({
                ...mockedAccount,
                current_subscription: {
                    ...mockedAccount.current_subscription,
                    scheduled_to_cancel_at: '2024-01-14T22:40:22+00:00',
                },
            }),
        })
        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={alteredStore}>
                    <UsageAndPlansView
                        contactBilling={jest.fn()}
                        periodEnd="2021-01-01"
                        currentUsage={mockedUsage}
                    />
                </Provider>
            </QueryClientProvider>
        )
        expect(ProductCardMock).toHaveBeenCalledTimes(5)
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            1,
            {
                type: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                usage: mockedUsage[ProductType.Helpdesk],
                isDisabled: false,
            },
            {}
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            2,
            {
                type: ProductType.Automation,
                usage: null,
                isDisabled: true,
            },
            {}
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            3,
            {
                type: ProductType.Voice,
                usage: null,
                isDisabled: true,
            },
            {}
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            4,
            {
                type: ProductType.SMS,
                usage: null,
                isDisabled: true,
            },
            {}
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            5,
            {
                type: ProductType.Convert,
                plan: convertPlan1,
                usage: mockedUsage[ProductType.Convert],
                isDisabled: false,
                autoUpgradeEnabled: false,
            },
            {}
        )

        const updateBillingFrequencyButton = container.querySelector(
            '#update-billing-frequency'
        )
        expect(updateBillingFrequencyButton).toHaveClass('disabledText')
        expect(updateBillingFrequencyButton).toHaveTextContent('Update')
        expect(container).toHaveTextContent(
            'Your Helpdesk subscription has been cancelled. ' +
                'It will remain active until the end of your billing cycle on January 14, 2024.'
        )
    })

    it('should render with active subscription containing Helpdesk and SMS products', () => {
        const helpdeskBanner = {
            description: 'Helpdesk banner',
            type: AlertType.Info,
        }
        const smsBanner = {
            description: 'SMS banner',
            type: AlertType.Info,
        }
        const alteredBilling = {
            ...mockedBilling,
            currentProductsUsage: {
                [ProductType.Helpdesk]:
                    currentProductsUsage[ProductType.Helpdesk],
                [ProductType.Automation]: null,
                [ProductType.Voice]: null,
                [ProductType.SMS]: {
                    data: {
                        extra_tickets_cost_in_cents: 0,
                        num_tickets: 0,
                        num_extra_tickets: 0,
                    },
                    meta: {
                        subscription_start_datetime:
                            '2024-01-22T00:46:32+00:00',
                        subscription_end_datetime: '2025-01-22T00:46:32+00:00',
                    },
                },
                [ProductType.Convert]: null,
            },
        }
        const alteredStore = mockedStore({
            billing: fromJS(alteredBilling),
            currentAccount: fromJS({
                ...mockedAccount,
                current_subscription: {
                    ...mockedAccount.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            basicMonthlyHelpdeskPlan.price_id,
                        [SMS_PRODUCT_ID]: smsPlan1.price_id,
                    },
                },
            }),
        })

        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={alteredStore}>
                    <UsageAndPlansView
                        contactBilling={jest.fn()}
                        periodEnd="2021-01-01"
                        currentUsage={alteredBilling.currentProductsUsage}
                        helpdeskBanner={helpdeskBanner}
                        smsBanner={smsBanner}
                    />
                </Provider>
            </QueryClientProvider>
        )
        expect(ProductCardMock).toHaveBeenCalledTimes(5)
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            1,
            {
                type: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                usage: alteredBilling.currentProductsUsage[
                    ProductType.Helpdesk
                ],
                banner: helpdeskBanner,
                isDisabled: false,
            },
            {}
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            2,
            {
                type: ProductType.Automation,
                plan: undefined,
                usage: null,
                isDisabled: false,
            },
            {}
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            3,
            {
                type: ProductType.Voice,
                plan: undefined,
                usage: null,
                isDisabled: false,
            },
            {}
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            4,
            {
                type: ProductType.SMS,
                plan: smsPlan1,
                usage: alteredBilling.currentProductsUsage[ProductType.SMS],
                isDisabled: false,
                banner: smsBanner,
            },
            {}
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            5,
            {
                type: ProductType.Convert,
                plan: undefined,
                usage: null,
                isDisabled: false,
                autoUpgradeEnabled: false,
            },
            {}
        )

        const updateBillingFrequencyButton = container.querySelector(
            '#update-billing-frequency'
        )
        expect(updateBillingFrequencyButton).toHaveClass('disabledText')
        expect(updateBillingFrequencyButton).toHaveTextContent('Update')
        expect(MockTooltip).toHaveBeenCalledWith(
            {
                autohide: false,
                children: expect.any(Array),
                className: 'tooltip',
                placement: 'top',
                target: 'update-billing-frequency',
            },
            {}
        )
    })

    it('should render with active subscription containing Helpdesk starter product', () => {
        const alteredBilling = {
            ...mockedBilling,
            products: [
                {
                    id: HELPDESK_PRODUCT_ID,
                    type: ProductType.Helpdesk,
                    prices: [starterHelpdeskPlan],
                },
                ...products.slice(1),
            ],
            currentProductsUsage: {
                [ProductType.Helpdesk]:
                    currentProductsUsage[ProductType.Helpdesk],
                [ProductType.Automation]: null,
                [ProductType.Voice]: null,
                [ProductType.SMS]: null,
                [ProductType.Convert]: null,
            },
        }
        const alteredStore = mockedStore({
            billing: fromJS(alteredBilling),
            currentAccount: fromJS({
                ...mockedAccount,
                current_subscription: {
                    ...mockedAccount.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]: starterHelpdeskPlan.price_id,
                    },
                },
            }),
        })

        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={alteredStore}>
                    <UsageAndPlansView
                        contactBilling={jest.fn()}
                        periodEnd="2021-01-01"
                        currentUsage={alteredBilling.currentProductsUsage}
                    />
                </Provider>
            </QueryClientProvider>
        )
        expect(ProductCardMock).toHaveBeenCalledTimes(5)
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            1,
            {
                type: ProductType.Helpdesk,
                plan: starterHelpdeskPlan,
                usage: alteredBilling.currentProductsUsage[
                    ProductType.Helpdesk
                ],
                isDisabled: true,
            },
            {}
        )
        const updateBillingFrequencyButton = container.querySelector(
            '#update-billing-frequency'
        )
        expect(updateBillingFrequencyButton).toHaveClass('disabledText')
        expect(updateBillingFrequencyButton).toHaveTextContent('Update')
        expect(MockTooltip).toHaveBeenCalledWith(
            {
                autohide: false,
                children:
                    'To change billing frequency, upgrade your Helpdesk plan to Basic or higher',
                className: 'tooltip',
                placement: 'top',
                target: 'update-billing-frequency',
            },
            {}
        )
    })

    it('should render with active subscription containing Automate legacy product', () => {
        const alteredBilling = {
            ...mockedBilling,
            products: [
                helpdeskProduct,
                {
                    id: AUTOMATION_PRODUCT_ID,
                    type: ProductType.Automation,
                    prices: [legacyBasicAutomatePlan],
                },
                ...products.slice(2),
            ],
            currentProductsUsage: {
                [ProductType.Helpdesk]:
                    currentProductsUsage[ProductType.Helpdesk],
                [ProductType.Automation]: {
                    data: {
                        extra_tickets_cost_in_cents: 0,
                        num_tickets: 0,
                        num_extra_tickets: 0,
                    },
                    meta: {
                        subscription_start_datetime:
                            '2024-01-22T00:46:32+00:00',
                        subscription_end_datetime: '2025-01-22T00:46:32+00:00',
                    },
                },
                [ProductType.Voice]: null,
                [ProductType.SMS]: null,
                [ProductType.Convert]: null,
            },
        }
        const alteredStore = mockedStore({
            billing: fromJS(alteredBilling),
            currentAccount: fromJS({
                ...mockedAccount,
                current_subscription: {
                    ...mockedAccount.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            basicMonthlyHelpdeskPlan.price_id,
                        [AUTOMATION_PRODUCT_ID]:
                            legacyBasicAutomatePlan.price_id,
                    },
                },
            }),
        })

        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={alteredStore}>
                    <UsageAndPlansView
                        contactBilling={jest.fn()}
                        periodEnd="2021-01-01"
                        currentUsage={alteredBilling.currentProductsUsage}
                    />
                </Provider>
            </QueryClientProvider>
        )
        expect(ProductCardMock).toHaveBeenCalledTimes(5)
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            1,
            {
                type: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                usage: alteredBilling.currentProductsUsage[
                    ProductType.Helpdesk
                ],
                isDisabled: false,
            },
            {}
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            2,
            {
                type: ProductType.Automation,
                plan: legacyBasicAutomatePlan,
                usage: alteredBilling.currentProductsUsage[
                    ProductType.Automation
                ],
                isDisabled: false,
            },
            {}
        )
        const updateBillingFrequencyButton = container.querySelector(
            '#update-billing-frequency'
        )
        expect(updateBillingFrequencyButton).toHaveClass('disabledText')
        expect(updateBillingFrequencyButton).toHaveTextContent('Update')
        expect(MockTooltip).toHaveBeenCalledWith(
            {
                autohide: false,
                children:
                    'To change billing frequency, update Automate to a non-legacy plan',
                className: 'tooltip',
                placement: 'top',
                target: 'update-billing-frequency',
            },
            {}
        )
    })
})
