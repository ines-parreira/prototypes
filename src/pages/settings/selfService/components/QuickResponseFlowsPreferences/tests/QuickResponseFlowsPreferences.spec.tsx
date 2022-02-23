import React from 'react'
import {Provider} from 'react-redux'
import {useParams, useRouteMatch} from 'react-router-dom'
import {render, screen, within, fireEvent} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import thunk from 'redux-thunk'
import MockDate from 'mockdate'
import {fromJS} from 'immutable'

import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'
import {ShopType} from 'models/selfServiceConfiguration/types'
import {updateSelfServiceConfiguration} from 'models/selfServiceConfiguration/resources'

import {billingState} from 'fixtures/billing'
import {account} from 'fixtures/account'
import {basicPlan} from 'fixtures/subscriptionPlan'
import {getEquivalentAutomationPlanId} from 'models/billing/utils'
import {initialState as helpCenterInitialState} from 'state/entities/helpCenter/reducer'

import QuickResponseFlowsPreferences from '../QuickResponseFlowsPreferences'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useParamsMock = useParams as jest.MockedFunction<typeof useParams>
const useRouteMatchMock = useRouteMatch as jest.MockedFunction<
    typeof useRouteMatch
>
jest.mock('react-router')

const updateSelfServiceConfigurationMock =
    updateSelfServiceConfiguration as jest.MockedFunction<
        typeof updateSelfServiceConfiguration
    >
jest.mock('models/selfServiceConfiguration/resources')

describe('<QuickResponseFlowsPreferences />', () => {
    const automationPlanId = getEquivalentAutomationPlanId(basicPlan.id)

    const defaultState = {
        currentAccount: fromJS({
            ...account,
            current_subscription: {
                ...account.current_subscription,
                plan: automationPlanId,
                status: 'active',
            },
        }),
        billing: fromJS({
            ...billingState,
            plans: fromJS({
                [basicPlan.id]: basicPlan,
                [automationPlanId]: {
                    ...basicPlan,
                    id: automationPlanId,
                    amount: basicPlan.amount + 2000,
                    automation_addon_included: true,
                },
            }),
        }),
        entities: {
            auditLogEvents: {},
            macros: {},
            rules: {},
            ruleRecipes: {},
            sections: {},
            stats: {},
            tags: {},
            views: {},
            viewsCount: {},
            helpCenter: helpCenterInitialState,
            selfServiceConfigurations: {
                1: {
                    id: 1,
                    type: 'shopify' as ShopType,
                    shop_name: `mystore1`,
                    created_datetime: '2021-01-26T00:29:00Z',
                    updated_datetime: '2021-01-26T00:29:30Z',
                    deactivated_datetime: '2021-01-26T00:30:00Z',
                    report_issue_policy: {
                        enabled: true,
                        cases: [],
                    },
                    track_order_policy: {
                        enabled: true,
                    },
                    cancel_order_policy: {
                        enabled: true,
                    },
                    return_order_policy: {
                        enabled: true,
                    },
                    quick_response_policies: [
                        {title: 'First', deactivated_datetime: null},
                        {title: 'Second', deactivated_datetime: null},
                        {title: 'Third', deactivated_datetime: null},
                        {title: 'Fourth', deactivated_datetime: null},
                        {
                            title: 'Fifth',
                            deactivated_datetime: '2020-01-01T00:00:00Z',
                        },
                    ],
                },
            },
            phoneNumbers: {},
        },
        integrations: fromJS({
            integrations: fromJS([
                {
                    id: 1,
                    type: 'shopify',
                    meta: {
                        shop_name: `mystore1`,
                    },
                    uri: `/api/integrations/1/`,
                },
            ]),
        }),
    }

    const date = '2021-01-24T17:30:00.000Z'

    beforeEach(() => {
        useParamsMock.mockReturnValue({
            shopName: 'mystore1',
            integrationType: 'shopify',
        })
        useRouteMatchMock.mockReturnValue({
            params: {
                shopName: 'mystore1',
                integrationType: 'shopify',
            },
            isExact: true,
            path: '',
            url: '',
        })
        MockDate.set(date)
    })

    afterEach(() => {
        MockDate.reset()
    })

    it('should show paywall if plan does not support automation addon', () => {
        const state = {
            ...defaultState,
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    ...account.current_subscription,
                    plan: basicPlan.id,
                    status: 'active',
                },
            }),
        }

        render(
            <Provider store={mockStore(state)}>
                <QuickResponseFlowsPreferences />
            </Provider>
        )

        screen.getByText('Leverage the power of Self-service')
    })

    it('should render saved quick response flows', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <QuickResponseFlowsPreferences />
            </Provider>
        )

        screen.getByText('First')
        screen.getByText('Second')
        screen.getByText('Third')
    })

    it('should limit enabled quick response flows to 4', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <QuickResponseFlowsPreferences />
            </Provider>
        )

        const disabledResponseRow = screen.getByText('Fifth')
            .parentElement as HTMLElement
        const toggle = within(disabledResponseRow).getByRole('switch')
        expect(toggle.className).toContain('disabled')
    })

    it('should update existing flow', async () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <QuickResponseFlowsPreferences />
            </Provider>
        )

        const itemToChange = screen.getByText('Second')
            .parentElement as HTMLElement
        const editButton = within(itemToChange).getByRole('button', {
            name: 'edit',
        })
        userEvent.click(editButton)

        const modalContainer = screen.getByRole('dialog')

        const input = within(modalContainer).getByLabelText(
            'Flow title'
        ) as HTMLInputElement
        expect(input.value).toBe('Second')

        userEvent.clear(input)
        await userEvent.type(input, 'Second edited')

        // TODO: replace with submit button click, now it's not working because of old version of Jest
        const form = modalContainer.querySelector('form') as HTMLFormElement
        fireEvent.submit(form)

        expect(updateSelfServiceConfigurationMock.mock.calls).toMatchSnapshot()
    })

    it('should add a new flow', async () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <QuickResponseFlowsPreferences />
            </Provider>
        )

        const addFlowButton = screen.getByRole('button', {name: /Add flow/i})
        userEvent.click(addFlowButton)

        const modalContainer = screen.getByRole('dialog')

        const input = within(modalContainer).getByLabelText(
            'Flow title'
        ) as HTMLInputElement
        await userEvent.type(input, 'New flow')

        // TODO: replace with submit button click, now it's not working because of old version of Jest
        const form = modalContainer.querySelector('form') as HTMLFormElement
        fireEvent.submit(form)

        expect(updateSelfServiceConfigurationMock.mock.calls).toMatchSnapshot()
    })

    it('should be able to remove quick response flow', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <QuickResponseFlowsPreferences />
            </Provider>
        )

        const itemToChange = screen.getByText('Second')
            .parentElement as HTMLElement
        const deleteButton = within(itemToChange).getByRole('button', {
            name: 'delete',
        })
        userEvent.click(deleteButton)

        const confirmButton = screen.getByRole('button', {name: 'Confirm'})
        userEvent.click(confirmButton)

        expect(updateSelfServiceConfigurationMock.mock.calls).toMatchSnapshot()
    })
})
