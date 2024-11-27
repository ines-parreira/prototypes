/* eslint-disable import/order */
import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {QueryClientProvider} from '@tanstack/react-query'
import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import client from 'models/api/resources'
import {RootState, StoreDispatch} from 'state/types'
import {account} from 'fixtures/account'
import {
    basicMonthlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
    products,
    SMS_PRODUCT_ID,
    smsPlan0,
    smsPlan1,
    VOICE_PRODUCT_ID,
    voicePlan0,
} from 'fixtures/productPrices'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {FeatureFlagKey} from 'config/featureFlags'
import {useBillingPlans} from '../useBillingPlan'
import {ProductType} from 'models/billing/types'
import thunk from 'redux-thunk'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>([
    thunk,
])

jest.mock('models/api/resources', () => ({
    get: jest.fn(),
    put: jest.fn(() => {
        return {
            data: {
                products: [],
            },
        }
    }),
}))

const mockedBilling = {
    invoices: [],
    products,
    currentProductsUsage: {
        helpdesk: {
            data: {
                extra_tickets_cost_in_cents: 0,
                num_extra_tickets: 0,
                num_tickets: 0,
            },
            meta: {
                subscription_start_datetime: '2021-01-01T00:00:00Z',
                subscription_end_datetime: '2021-02-01T00:00:00Z',
            },
        },
        automation: null,
        voice: null,
        sms: null,
    },
}

const store = mockedStore({
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.price_id,
            },
        },
    }),
    billing: fromJS(mockedBilling),
})

describe('useBillingPlans', () => {
    beforeEach(() => {
        resetLDMocks()
        mockFlags({
            [FeatureFlagKey.BillingVoiceSmsSelfServe]: true,
        })
    })

    it('should submit a support ticket when a non-vetted user selects a phone plan', async () => {
        const dispatchBillingError = jest.fn()
        const queryClient = mockQueryClient()

        const {result} = renderHook(
            () =>
                useBillingPlans({
                    dispatchBillingError,
                }),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={store}>{children}</Provider>
                    </QueryClientProvider>
                ),
            }
        )

        result.current.setSelectedPlans((prev) => ({
            ...prev,
            [ProductType.SMS]: {
                plan: smsPlan1,
                isSelected: true,
            },
        }))
        await result.current.updateSubscription()

        expect(client.get).toHaveBeenCalledTimes(1)
        // ticket created should contain "SMS plan request: SMS Addon 150 Monthly"
        expect(client.get).toHaveBeenCalledWith(
            'https://hooks.zapier.com/hooks/catch/9639651/3hsj6pb/?message=New%20SMS%20Add-on%20Request%20by%20acme%0AProduct(s)%3A%20SMS%20Add-on%20Plan%20selection%20-%20acme%0ASMS%20plan%20request%3A%20SMS%20Addon%20150%20Monthly&from=undefined&to=billing%40gorgias.com&subject=SMS%20Add-on%20Plan%20selection%20-%20acme&helpdeskPlan=Basic&freeTrial=true&account=acme',
            {
                transformRequest: expect.any(Function),
            }
        )
    })

    it('should update subscriptions when a vetted user changes phone plans', async () => {
        const dispatchBillingError = jest.fn()
        const queryClient = mockQueryClient()
        const alteredStore = mockedStore({
            billing: fromJS(mockedBilling),
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    ...account.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            basicMonthlyHelpdeskPlan.price_id,
                        [SMS_PRODUCT_ID]: smsPlan0.price_id,
                        [VOICE_PRODUCT_ID]: voicePlan0.price_id,
                    },
                },
            }),
        })

        const {result} = renderHook(
            () =>
                useBillingPlans({
                    dispatchBillingError,
                }),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={alteredStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            }
        )

        result.current.setSelectedPlans((prev) => ({
            ...prev,
            [ProductType.SMS]: {
                plan: smsPlan1,
                isSelected: true,
            },
        }))
        await result.current.updateSubscription()

        // ensure we're not trying to create a support ticket
        expect(client.get).not.toHaveBeenCalled()

        expect(client.put).toHaveBeenCalledTimes(1)
        expect(client.put).toHaveBeenCalledWith('/api/billing/subscription/', {
            prices: [
                basicMonthlyHelpdeskPlan.price_id,
                voicePlan0.price_id, // current voice plan stays in place
                smsPlan1.price_id,
            ],
        })
    })
})
