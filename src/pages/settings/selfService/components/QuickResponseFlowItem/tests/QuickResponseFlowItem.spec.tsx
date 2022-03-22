import React from 'react'
import {Provider} from 'react-redux'
import {useParams, useRouteMatch} from 'react-router-dom'
import {render, screen, fireEvent} from '@testing-library/react'
import thunk from 'redux-thunk'
import MockDate from 'mockdate'
import {fromJS, Map} from 'immutable'

import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'

import {account} from 'fixtures/account'
import {basicPlan} from 'fixtures/subscriptionPlan'

import history from '../../../../../history'
import QuickResponseFlowItem from '../QuickResponseFlowItem'
import {defaultState} from '../../QuickResponseFlowsPreferences/tests/constants'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useParamsMock = useParams as jest.MockedFunction<typeof useParams>
const useRouteMatchMock = useRouteMatch as jest.MockedFunction<
    typeof useRouteMatch
>
jest.mock('react-router')

jest.mock('models/selfServiceConfiguration/resources')

describe('<QuickResponseFlowItem />', () => {
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
                <QuickResponseFlowItem handleSubmit={jest.fn()} />
            </Provider>
        )

        screen.getByText('Leverage the power of Self-service')
    })

    it('with no initial value', () => {
        const mockHandleSubmit = jest.fn()

        const {getByText, getByLabelText} = render(
            <Provider store={mockStore(defaultState)}>
                <QuickResponseFlowItem handleSubmit={mockHandleSubmit} />
            </Provider>
        )

        getByText('New Flow')
        const createFlowButton = getByText('Create Flow') as HTMLInputElement
        expect(createFlowButton.disabled).toBe(true)

        fireEvent.click(getByText('Cancel'))

        expect(history.push).toHaveBeenLastCalledWith(
            '/app/settings/self-service/shopify/mystore1/preferences/quick-response'
        )
        fireEvent.change(getByLabelText('Button label'), {
            target: {value: 'label'},
        })

        expect(createFlowButton.disabled).toBe(false)

        fireEvent.click(createFlowButton)

        expect(mockHandleSubmit).toHaveBeenCalledWith({
            buttonLabel: 'label',
            responseText: {
                message: Map({html: '<div><br></div>', text: ''}),
            },
        })
    })

    it('with initial value', () => {
        const mockHandleSubmit = jest.fn()
        const mockHandleDelete = jest.fn()

        const {getByText, getByLabelText} = render(
            <Provider store={mockStore(defaultState)}>
                <QuickResponseFlowItem
                    handleSubmit={mockHandleSubmit}
                    initialValue={{
                        buttonLabel: 'label',
                        responseText: {message: fromJS({})},
                    }}
                    handleDelete={mockHandleDelete}
                />
            </Provider>
        )

        getByText('Edit Flow')
        const saveChangesButton = getByText('Save Changes') as HTMLInputElement
        expect(saveChangesButton.disabled).toBe(false)

        fireEvent.click(getByText('Delete Flow'))
        getByText('Are you sure you want to delete this quick response flow?')
        fireEvent.click(getByText('Confirm'))

        expect(mockHandleDelete).toHaveBeenCalled()
        expect(history.push).toHaveBeenLastCalledWith(
            '/app/settings/self-service/shopify/mystore1/preferences/quick-response'
        )
        fireEvent.change(getByLabelText('Button label'), {
            target: {value: ''},
        })
        expect(saveChangesButton.disabled).toBe(true)

        fireEvent.change(getByLabelText('Button label'), {
            target: {value: 'another label'},
        })
        expect(saveChangesButton.disabled).toBe(false)

        fireEvent.click(saveChangesButton)

        expect(mockHandleSubmit).toHaveBeenCalledWith({
            buttonLabel: 'another label',
            responseText: {
                message: Map({html: '<div><br></div>', text: ''}),
            },
        })
    })
})
