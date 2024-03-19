import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'

import {QueryClientProvider} from '@tanstack/react-query'
import {RootState, StoreDispatch} from 'state/types'
import {
    products,
    currentProductsUsage,
    HELPDESK_PRODUCT_ID,
    basicMonthlyHelpdeskPrice,
    CONVERT_PRODUCT_ID,
    convertPrice1,
} from 'fixtures/productPrices'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {account} from 'fixtures/account'
import {assumeMock} from 'utils/testing'
import {ProductType} from 'models/billing/types'
import {AlertType} from 'pages/common/components/Alert/Alert'
import ProductCard from '../../../components/ProductCard'
import {ProductCardProps} from '../../../components/ProductCard/ProductCard'
import UsageAndPlansView from '../UsageAndPlansView'

jest.mock('../../../components/ProductCard', () =>
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
            [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPrice.price_id,
            [CONVERT_PRODUCT_ID]: convertPrice1.price_id,
        },
        status: 'active',
    },
}
const store = mockedStore({
    billing: fromJS(mockedBilling),
    currentAccount: fromJS(mockedAccount),
})

describe('UsageAndPlansView', () => {
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
                product: basicMonthlyHelpdeskPrice,
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
                product: undefined,
                usage: null,
                isDisabled: false,
            },
            {}
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            3,
            {
                type: ProductType.Voice,
                product: undefined,
                usage: null,
                isDisabled: false,
            },
            {}
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            4,
            {
                type: ProductType.SMS,
                product: undefined,
                usage: null,
                isDisabled: false,
            },
            {}
        )
        expect(ProductCardMock).toHaveBeenNthCalledWith(
            5,
            {
                type: ProductType.Convert,
                product: convertPrice1,
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
                product: basicMonthlyHelpdeskPrice,
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
                product: convertPrice1,
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
})
