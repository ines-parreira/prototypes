import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {
    AUTOMATION_PRODUCT_ID,
    automationProduct,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    CONVERT_PRODUCT_ID,
    convertAvailablePlans,
    HELPDESK_PRODUCT_ID,
    helpdeskProduct,
    monthlyConvertPlan,
    monthlySmsPlan,
    monthlyVoicePlan,
    SMS_PRODUCT_ID,
    smsAvailablePlans,
    VOICE_PRODUCT_ID,
    voiceAvailablePlans,
} from 'fixtures/productPrices'
import { Cadence, Product, ProductType } from 'models/billing/types'
import { getCadenceName } from 'models/billing/utils'
import * as getCorrespondingPlanAtCadence from 'pages/settings/new_billing/utils/getCorrespondingPlanAtCadence'
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

const voiceProduct: Product<ProductType.Voice> = {
    id: VOICE_PRODUCT_ID,
    type: ProductType.Voice,
    prices: voiceAvailablePlans.concat([monthlyVoicePlan]),
}

const smsProduct: Product<ProductType.SMS> = {
    id: SMS_PRODUCT_ID,
    type: ProductType.SMS,
    prices: smsAvailablePlans.concat([monthlySmsPlan]),
}

const convertProduct: Product<ProductType.Convert> = {
    id: CONVERT_PRODUCT_ID,
    type: ProductType.Convert,
    prices: convertAvailablePlans.concat([monthlyConvertPlan]),
}

const store = mockedStore({
    billing: fromJS({
        invoices: [],
        products: [
            helpdeskProduct,
            automationProduct,
            smsProduct,
            voiceProduct,
            convertProduct,
        ],
        currentProductsUsage: {},
    }),
    currentAccount: fromJS({
        current_subscription: {
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.price_id,
                [AUTOMATION_PRODUCT_ID]: basicMonthlyAutomationPlan.price_id,
                [VOICE_PRODUCT_ID]: monthlyVoicePlan.price_id,
                [SMS_PRODUCT_ID]: monthlySmsPlan.price_id,
                [CONVERT_PRODUCT_ID]: monthlyConvertPlan.price_id,
            },
        },
    }),
})

const renderBillingFrequencyView = () =>
    renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={store}>
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

describe('BillingFrequencyView', () => {
    it('should render', () => {
        const { container } = renderBillingFrequencyView()
        expect(container).toMatchSnapshot()
    })
    it('clicking on yearly/monthly radio button should modify the total price from yearly to monthly and vice versa', () => {
        const { getByLabelText } = renderBillingFrequencyView()
        const monthlyRadioButton = getByLabelText(
            getCadenceName(Cadence.Month),
            {
                selector: 'input',
            },
        )
        const yearlyRadioButton = getByLabelText(getCadenceName(Cadence.Year), {
            selector: 'input',
        })
        const totalPrice = getByLabelText('Total price', {
            selector: 'span',
        })
        fireEvent.click(yearlyRadioButton)
        expect(monthlyRadioButton).not.toBeChecked()
        expect(yearlyRadioButton).toBeChecked()
        expect(totalPrice.textContent).toBe('$1,292')
        fireEvent.click(monthlyRadioButton)
        expect(monthlyRadioButton).toBeChecked()
        expect(yearlyRadioButton).not.toBeChecked()
        expect(totalPrice.textContent).toBe('$129.20')
    })
    it('Not finding the plan at the desired cadence should disable the radio button', () => {
        const getCorrespondingPlanAtCadenceSpy = jest.spyOn(
            getCorrespondingPlanAtCadence,
            'getCorrespondingPlanAtCadence',
        )
        getCorrespondingPlanAtCadenceSpy.mockImplementation(() => {
            throw new Error('Plan not found at this cadence')
        })
        const { getByLabelText } = renderBillingFrequencyView()
        const monthlyRadioButton = getByLabelText(
            getCadenceName(Cadence.Month),
            {
                selector: 'input',
            },
        )
        const yearlyRadioButton = getByLabelText(getCadenceName(Cadence.Year), {
            selector: 'input',
        })
        fireEvent.click(yearlyRadioButton)
        expect(yearlyRadioButton).toBeDisabled()
        expect(monthlyRadioButton).toBeChecked()
    })
})
