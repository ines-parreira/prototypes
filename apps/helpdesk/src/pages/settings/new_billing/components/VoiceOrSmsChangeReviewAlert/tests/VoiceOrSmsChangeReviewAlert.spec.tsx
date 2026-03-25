import React from 'react'

import type { SelectedPlans } from '@repo/billing'
import { resetLDMocks } from '@repo/feature-flags/testing'
import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import {
    basicMonthlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
    products,
    SMS_PRODUCT_ID,
    smsPlan0,
    smsPlan1,
    VOICE_PRODUCT_ID,
    voicePlan0,
    voicePlan1,
} from 'fixtures/plans'
import type { RootState, StoreDispatch } from 'state/types'

import VoiceOrSmsChangeReviewAlert from '../VoiceOrSmsChangeReviewAlert'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>([
    thunk,
])

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

describe('VoiceOrSmsChangeReviewAlert', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        resetLDMocks()
    })

    describe('alert for users vetted for phone', () => {
        const store = mockedStore({
            billing: fromJS(mockedBilling),
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    ...account.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                        [SMS_PRODUCT_ID]: smsPlan0.plan_id,
                        [VOICE_PRODUCT_ID]: voicePlan0.plan_id,
                    },
                },
            }),
        })
        const selectedPlans: SelectedPlans = {
            helpdesk: {
                plan: undefined,
                isSelected: false,
            },
            automation: {
                plan: undefined,
                isSelected: false,
            },
            convert: {
                plan: undefined,
                isSelected: false,
            },
            sms: {
                plan: smsPlan1,
                isSelected: true,
            },
            voice: {
                plan: voicePlan1,
                isSelected: true,
            },
        }

        it('should not display the alert if the user is vetted for phone ', () => {
            const { queryByText } = render(
                <Provider store={store}>
                    <VoiceOrSmsChangeReviewAlert
                        selectedPlans={selectedPlans}
                    />
                </Provider>,
            )

            expect(
                queryByText(/subscription will have to be reviewed/),
            ).toBeNull()
        })
    })

    it("should display the alert with 'voice & sms' if both were changed", () => {
        const store = mockedStore({
            billing: fromJS(mockedBilling),
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    ...account.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                    },
                },
            }),
        })
        const selectedPlans: SelectedPlans = {
            helpdesk: {
                plan: undefined,
                isSelected: false,
            },
            automation: {
                plan: undefined,
                isSelected: false,
            },
            convert: {
                plan: undefined,
                isSelected: false,
            },
            sms: {
                plan: smsPlan1,
                isSelected: true,
            },
            voice: {
                plan: voicePlan1,
                isSelected: true,
            },
        }
        const { getByText } = render(
            <Provider store={store}>
                <VoiceOrSmsChangeReviewAlert selectedPlans={selectedPlans} />
            </Provider>,
        )

        expect(
            getByText(
                /Your.*Voice & SMS.*subscription will have to be reviewed/,
            ),
        ).toBeInTheDocument()
    })

    it("should display the alert with 'Voice' if only voice was changed", () => {
        const store = mockedStore({
            billing: fromJS(mockedBilling),
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    ...account.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                    },
                },
            }),
        })
        const selectedPlans: SelectedPlans = {
            helpdesk: {
                plan: undefined,
                isSelected: false,
            },
            automation: {
                plan: undefined,
                isSelected: false,
            },
            convert: {
                plan: undefined,
                isSelected: false,
            },
            sms: {
                plan: undefined,
                isSelected: false,
            },
            voice: {
                plan: voicePlan1,
                isSelected: true,
            },
        }
        const { getByText } = render(
            <Provider store={store}>
                <VoiceOrSmsChangeReviewAlert selectedPlans={selectedPlans} />
            </Provider>,
        )

        expect(
            getByText(/Your.*Voice.*subscription will have to be reviewed/),
        ).toBeInTheDocument()
    })

    it("should display the alert with 'SMS' if only sms was changed", () => {
        const alteredStore = mockedStore({
            billing: fromJS(mockedBilling),
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    ...account.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                    },
                },
            }),
        })
        const selectedPlans: SelectedPlans = {
            helpdesk: {
                plan: undefined,
                isSelected: false,
            },
            automation: {
                plan: undefined,
                isSelected: false,
            },
            convert: {
                plan: undefined,
                isSelected: false,
            },
            sms: {
                plan: smsPlan1,
                isSelected: true,
            },
            voice: {
                plan: undefined,
                isSelected: false,
            },
        }
        const { getByText } = render(
            <Provider store={alteredStore}>
                <VoiceOrSmsChangeReviewAlert selectedPlans={selectedPlans} />
            </Provider>,
        )

        expect(
            getByText(/Your.*SMS.*subscription will have to be reviewed/),
        ).toBeInTheDocument()
    })
})
