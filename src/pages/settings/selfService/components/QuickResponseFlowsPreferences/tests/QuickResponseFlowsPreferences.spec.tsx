import React from 'react'
import {Provider} from 'react-redux'
import {useParams, useRouteMatch} from 'react-router-dom'
import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import thunk from 'redux-thunk'
import MockDate from 'mockdate'
import {fromJS} from 'immutable'

import configureMockStore from 'redux-mock-store'

import * as utils from 'utils/environment'
import {RootState, StoreDispatch} from 'state/types'

import {account} from 'fixtures/account'
import {basicPlan} from 'fixtures/subscriptionPlan'

import history from '../../../../../history'
import QuickResponseFlowsPreferences from '../QuickResponseFlowsPreferences'
import {defaultState} from './constants'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useParamsMock = useParams as jest.MockedFunction<typeof useParams>
const useRouteMatchMock = useRouteMatch as jest.MockedFunction<
    typeof useRouteMatch
>
jest.mock('react-router')

describe('<QuickResponseFlowsPreferences />', () => {
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
        jest.clearAllMocks()
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

        const savedFlows = ['First', 'Second', 'Third']
        const containerIds = ['configurationColumn', 'previewColumn']

        savedFlows.forEach((flow) => {
            containerIds.forEach((containerId) => {
                const container = screen.getByTestId(containerId)
                within(container).getByText(flow)
            })
        })
    })

    it('should limit enabled quick response flows to 4', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <QuickResponseFlowsPreferences />
            </Provider>
        )

        const container = screen.getByTestId('configurationColumn')
        const disabledResponseRow = within(container).getByText('Fifth')
            .parentElement as HTMLElement
        const toggle = within(disabledResponseRow).getByRole('switch')
        expect(toggle.className).toContain('disabled')
    })

    it('should redirect to edit flow page', () => {
        jest.spyOn(utils, 'isProduction').mockReturnValue(false)
        render(
            <Provider store={mockStore(defaultState)}>
                <QuickResponseFlowsPreferences />
            </Provider>
        )

        const container = screen.getByTestId('configurationColumn')
        const itemToChange = within(container).getByText('Second')
            .parentElement as HTMLElement
        const editButton = within(itemToChange).getByRole('button', {
            name: 'chevron_right',
        })
        userEvent.click(editButton)

        expect(history.push).toHaveBeenLastCalledWith(
            '/app/settings/self-service/shopify/mystore1/preferences/quick-response/2'
        )
    })

    it('should redirect to the new flow page', () => {
        jest.spyOn(utils, 'isProduction').mockReturnValue(false)
        render(
            <Provider store={mockStore(defaultState)}>
                <QuickResponseFlowsPreferences />
            </Provider>
        )

        const addFlowButton = screen.getByRole('button', {name: /Add flow/i})
        userEvent.click(addFlowButton)

        expect(history.push).toHaveBeenLastCalledWith(
            '/app/settings/self-service/shopify/mystore1/preferences/quick-response/new'
        )
    })
})
