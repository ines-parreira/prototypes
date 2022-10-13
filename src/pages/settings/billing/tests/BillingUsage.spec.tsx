import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {RootState} from 'state/types'

import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {
    HELPDESK_PRODUCT_ID,
    proMonthlyHelpdeskPrice,
} from 'fixtures/productPrices'
import BillingUsage from '../BillingUsage'

jest.mock('../../../common/components/LegacyPlanBanner', () => () => (
    <div>Legacy Plan Banner Mock</div>
))
jest.mock('../../../../state/billing/actions.ts')

const mockStore = configureMockStore([thunk])

describe('<BillingUsage/>', () => {
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS({
            ...account,
            current_subscription: {
                ...account.current_subscription,
                products: {
                    [HELPDESK_PRODUCT_ID]: proMonthlyHelpdeskPrice.price_id,
                },
                status: 'active',
            },
        }),
        billing: fromJS({
            ...billingState,
            currentUsage: fromJS({
                meta: {
                    start_datetime: '2010-10-10',
                    end_datetime: '2010-10-11',
                },
                data: {
                    cost: 10,
                    tickets: 1000,
                },
            }),
        }),
    }

    window.GORGIAS_SUPPORT_EMAIL = 'support@gorgias.com'

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display loader', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingUsage />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should load with empty props', async () => {
        const {container, getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingUsage />
            </Provider>
        )
        await waitFor(() => getByText('Usage & Plans'))
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display price', async () => {
        const {container, getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingUsage />
            </Provider>
        )
        await waitFor(() => getByText('Usage & Plans'))
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display warning progress bar', async () => {
        const {getByText} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    billing: fromJS({
                        ...billingState,
                        currentUsage: {
                            meta: {
                                start_datetime: '2010-10-10',
                                end_datetime: '2010-10-11',
                            },
                            data: {
                                cost: 10,
                                tickets: 2000,
                            },
                        },
                    }),
                })}
            >
                <BillingUsage />
            </Provider>
        )

        await waitFor(() => getByText('Usage & Plans'))

        expect(
            document.getElementsByClassName('usage-progress')[0]
        ).toMatchSnapshot()
    })

    it('should display danger progress bar', async () => {
        const {getByText} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    billing: fromJS({
                        ...billingState,
                        currentUsage: {
                            meta: {
                                start_datetime: '2010-10-10',
                                end_datetime: '2010-10-11',
                            },
                            data: {
                                cost: 10,
                                tickets: 3200,
                            },
                        },
                    }),
                })}
            >
                <BillingUsage />
            </Provider>
        )

        await waitFor(() => getByText('Usage & Plans'))

        expect(
            document.getElementsByClassName('usage-progress')[0]
        ).toMatchSnapshot()
    })

    it('should display tooltip', async () => {
        const {findByText, getAllByText} = render(
            <Provider store={mockStore(defaultState)}>
                <BillingUsage />
            </Provider>
        )
        const tooltipTarget = await waitFor(
            () => getAllByText('info_outline')[0]
        )
        fireEvent.mouseOver(tooltipTarget)

        const tooltipElement = await findByText(/Number of tickets included/)
        expect(tooltipElement).toMatchSnapshot()
    })
})
