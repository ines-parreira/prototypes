import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    automationProduct,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    CONVERT_PRODUCT_ID,
    convertProduct,
    HELPDESK_PRODUCT_ID,
    helpdeskProduct,
    monthlyConvertPlan,
    monthlySmsPlan,
    monthlyVoicePlan,
    SMS_PRODUCT_ID,
    smsProduct,
    VOICE_PRODUCT_ID,
    voiceProduct,
} from 'fixtures/productPrices'
import { Cadence, Plan, Product, ProductType } from 'models/billing/types'
import {
    getCadenceName,
    isOtherCadenceDowngrade,
    isOtherCadenceUpgrade,
} from 'models/billing/utils'
import { formatAmount } from 'pages/settings/new_billing/utils/formatAmount'
import { getCorrespondingPlanAtCadence } from 'pages/settings/new_billing/utils/getCorrespondingPlanAtCadence'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import BillingFrequencyView from '../BillingFrequencyView'

const queryClient = mockQueryClient()
const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useParams: jest.fn().mockReturnValue({
        selectedProduct: 'helpdesk',
    }),
}))

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const defaultStore: DeepPartial<RootState> = {
    billing: fromJS(billingState),
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.price_id,
                [AUTOMATION_PRODUCT_ID]: basicMonthlyAutomationPlan.price_id,
                [VOICE_PRODUCT_ID]: monthlyVoicePlan.price_id,
                [SMS_PRODUCT_ID]: monthlySmsPlan.price_id,
                [CONVERT_PRODUCT_ID]: monthlyConvertPlan.price_id,
            },
        },
    }),
}

const renderBillingFrequencyView = (storeOverride?: DeepPartial<RootState>) =>
    renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockedStore(storeOverride ?? defaultStore)}>
                <BillingFrequencyView
                    isTrialing={false}
                    isCurrentSubscriptionCanceled={false}
                    periodEnd="2021-01-01"
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                />
            </Provider>
        </QueryClientProvider>,
    )

const getRadioButton = (cadence: Cadence) => {
    // The component used wraps a radio input inside a div with forced aria labels
    // this means getByRole finds multiple, so we need to filter these down to what
    // we are really looking for - i.e. the radio component
    const components = screen.getAllByRole('radio', {
        name: getCadenceName(cadence),
    })
    return components.find((el) => el.getAttribute('type') === 'radio')
}

describe('BillingFrequencyView', () => {
    const cadenceValues = Object.values(Cadence)
    const productTypeValues = Object.values(ProductType)

    it('should render', () => {
        renderBillingFrequencyView()

        expect(
            screen.getByText(
                'Changing your billing frequency will apply on all your subscribed products',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('heading', { name: 'Billing frequency' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /See Plans Details/i }),
        ).toBeInTheDocument()
        for (const cadence of cadenceValues) {
            // The component used wraps a radio input inside a div with forced aria labels
            // this means getByRole finds multiple, so we need to filter these down to what
            // we are really looking for - i.e. the radio component
            const components = screen.getAllByRole('radio', {
                name: getCadenceName(cadence),
            })
            const inputElement = components.find(
                (el) => el.getAttribute('type') === 'radio',
            )
            expect(inputElement).toBeInTheDocument()
            expect(inputElement).toHaveAttribute('type', 'radio')
        }
        expect(
            screen.getByRole('heading', { name: 'Summary' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Update Subscription' }),
        ).toBeInTheDocument()
    })

    const cadenceCartesianProduct = cadenceValues.flatMap((a) =>
        cadenceValues.map((b) => [a, b]),
    )
    it.each(cadenceCartesianProduct)(
        'clicking on billing frequency radio button should modify the total price appropriately [originalCadence=%s, newCadence=%s]',
        async (originalCadence: Cadence, newCadence: Cadence) => {
            const availablePlans: { [key in ProductType]: Plan[] } = {
                [ProductType.Helpdesk]: helpdeskProduct.prices,
                [ProductType.Automation]: automationProduct.prices,
                [ProductType.Voice]: smsProduct.prices,
                [ProductType.SMS]: voiceProduct.prices,
                [ProductType.Convert]: convertProduct.prices,
            }
            const originalPlans: { [key in ProductType]?: Plan } =
                Object.fromEntries(
                    productTypeValues.map((productType) => [
                        productType,
                        availablePlans[productType].find(
                            (plan: Plan) => plan.cadence === originalCadence,
                        ),
                    ]),
                )
            const newPlans: { [key in ProductType]?: Plan } =
                Object.fromEntries(
                    productTypeValues.map((productType) => [
                        productType,
                        getCorrespondingPlanAtCadence({
                            availablePlans: availablePlans[productType],
                            currentPlan: originalPlans[productType],
                            cadence: newCadence,
                        }),
                    ]),
                )

            // If any of these are undefined, the test is misconfigured
            // because we don't have a corresponding plan for the product
            for (const productType of productTypeValues) {
                expect(originalPlans[productType]).toBeDefined()
                expect(newPlans[productType]).toBeDefined()
            }

            const originalPrice = Object.values(originalPlans)
                .map((plan: Plan) => plan.amount)
                .reduce((a: number, b: number) => a + b, 0)
            const originalPriceFormatted = formatAmount(
                originalPrice / 100,
                originalPlans[ProductType.Helpdesk]?.currency,
            )

            const newPrice = Object.values(newPlans)
                .map((plan: Plan) => plan.amount)
                .reduce((a: number, b: number) => a + b, 0)
            const newPriceFormatted = formatAmount(
                newPrice / 100,
                originalPlans[ProductType.Helpdesk]?.currency,
            )

            const storeOverride: DeepPartial<RootState> = {
                ...defaultStore,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                originalPlans[ProductType.Helpdesk]?.price_id,
                            [AUTOMATION_PRODUCT_ID]:
                                originalPlans[ProductType.Automation]?.price_id,
                            [VOICE_PRODUCT_ID]:
                                originalPlans[ProductType.Voice]?.price_id,
                            [SMS_PRODUCT_ID]:
                                originalPlans[ProductType.SMS]?.price_id,
                            [CONVERT_PRODUCT_ID]:
                                originalPlans[ProductType.Convert]?.price_id,
                        },
                    },
                }),
            }

            renderBillingFrequencyView(storeOverride)

            const totalPrice = screen.getByLabelText('Total price', {
                selector: 'span',
            })
            expect(totalPrice.textContent).toBe(originalPriceFormatted)

            const radioButton = getRadioButton(newCadence)
            expect(radioButton).toBeInTheDocument()
            if (!radioButton) return

            await act(() => userEvent.click(radioButton))

            if (isOtherCadenceDowngrade(originalCadence, newCadence)) {
                // Clicking the radio button should be a no-op due to being disabled
                expect(radioButton).toBeDisabled()
                expect(totalPrice.textContent).toBe(originalPriceFormatted)
            } else {
                expect(radioButton).toBeEnabled()
                expect(totalPrice.textContent).toBe(newPriceFormatted)
            }
        },
    )

    const cadenceUpgradesProductTypeCartesianProduct = cadenceCartesianProduct
        .filter(([originalCadence, newCadence]) =>
            isOtherCadenceUpgrade(originalCadence, newCadence),
        )
        .flatMap(([originalCadence, newCadence]) =>
            productTypeValues.map(
                (productType: ProductType): [Cadence, Cadence, ProductType] => [
                    originalCadence,
                    newCadence,
                    productType,
                ],
            ),
        )
    // N.B. we only consider cadence upgrades here as a downgrade would also be disabled, but for other reasons, and is covered by other tests
    it.each(cadenceUpgradesProductTypeCartesianProduct)(
        'should disable the billing frequncy radio button when there are no suitable plans at that cadence [originalCadence=%s, newCadence=%s, productType=%s]',
        async (
            originalCadence: Cadence,
            newCadence: Cadence,
            productType: ProductType,
        ) => {
            const availablePlans: { [key in ProductType]: Plan[] } = {
                [ProductType.Helpdesk]: helpdeskProduct.prices,
                [ProductType.Automation]: automationProduct.prices,
                [ProductType.Voice]: smsProduct.prices,
                [ProductType.SMS]: voiceProduct.prices,
                [ProductType.Convert]: convertProduct.prices,
            }
            const originalPlans: { [key in ProductType]?: Plan } =
                Object.fromEntries(
                    productTypeValues.map((productType) => [
                        productType,
                        availablePlans[productType].find(
                            (plan: Plan) => plan.cadence === originalCadence,
                        ),
                    ]),
                )

            // If any of these are undefined, the test is misconfigured
            // because we don't have a corresponding plan for the product
            for (const productType of productTypeValues) {
                expect(originalPlans[productType]).toBeDefined()
            }

            const storeOverride: DeepPartial<RootState> = {
                ...defaultStore,
                billing: fromJS({
                    ...billingState,
                    products: billingState.products.map(
                        (product: Product<ProductType>) => ({
                            ...product,
                            prices: product.prices.filter(
                                // Remove any plans which could be selected
                                (plan: Plan) =>
                                    !(
                                        plan.product === productType &&
                                        plan.cadence === newCadence
                                    ),
                            ),
                        }),
                    ),
                }),
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: {
                            [HELPDESK_PRODUCT_ID]:
                                originalPlans[ProductType.Helpdesk]?.price_id,
                            [AUTOMATION_PRODUCT_ID]:
                                originalPlans[ProductType.Automation]?.price_id,
                            [VOICE_PRODUCT_ID]:
                                originalPlans[ProductType.Voice]?.price_id,
                            [SMS_PRODUCT_ID]:
                                originalPlans[ProductType.SMS]?.price_id,
                            [CONVERT_PRODUCT_ID]:
                                originalPlans[ProductType.Convert]?.price_id,
                        },
                    },
                }),
            }

            renderBillingFrequencyView(storeOverride)

            const radioButton = getRadioButton(newCadence)
            expect(radioButton).toBeInTheDocument()
            expect(radioButton).toBeDisabled()
        },
    )
})
