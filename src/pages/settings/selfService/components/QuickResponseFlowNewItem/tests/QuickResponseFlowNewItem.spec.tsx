import React from 'react'
import {Provider} from 'react-redux'
import {useParams, useRouteMatch} from 'react-router-dom'
import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import thunk from 'redux-thunk'
import MockDate from 'mockdate'
import {fromJS, Map} from 'immutable'

import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'

import {account} from 'fixtures/account'
import {basicPlan} from 'fixtures/subscriptionPlan'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'

import history from '../../../../../history'
import QuickResponseFlowNewItem from '../QuickResponseFlowNewItem'
import {defaultState} from '../../QuickResponseFlowsPreferences/tests/constants'
import * as hooks from '../../QuickResponseFlowItem/hooks'

jest.mock('store/middlewares/segmentTracker', () => {
    const segmentTracker: Record<string, unknown> = jest.requireActual(
        'store/middlewares/segmentTracker'
    )

    return {
        ...segmentTracker,
        logEvent: jest.fn(),
    }
})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useParamsMock = useParams as jest.MockedFunction<typeof useParams>
const useRouteMatchMock = useRouteMatch as jest.MockedFunction<
    typeof useRouteMatch
>
jest.mock('react-router')

jest.mock('models/selfServiceConfiguration/resources')

describe('<QuickResponseFlowNewItem />', () => {
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
                <QuickResponseFlowNewItem />
            </Provider>
        )

        screen.getByText('Leverage the power of Self-service')
    })

    it('should create a new flow', async () => {
        const updateQuickReplyPoliciesSpy = jest.fn()
        jest.spyOn(hooks, 'useUpdateQuickReplyPolicies').mockImplementation(
            () => ({updateQuickReplyPolicies: updateQuickReplyPoliciesSpy})
        )

        const {getByText, getByLabelText} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    entities: {
                        ...defaultState.entities,
                        selfServiceConfigurations: {
                            1: {
                                ...defaultState.entities
                                    .selfServiceConfigurations[1],
                                quick_response_policies: [
                                    {
                                        id: 'another-id',
                                        title: 'title',
                                        deactivated_datetime: null,
                                        response_message_content: {
                                            html: '<div><br></div>',
                                            text: '',
                                        },
                                    },
                                ],
                            },
                        },
                    },
                })}
            >
                <QuickResponseFlowNewItem />
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

        expect(updateQuickReplyPoliciesSpy).toHaveBeenCalledWith([
            {
                deactivated_datetime: null,
                id: 'another-id',
                title: 'title',
                response_message_content: {html: '<div><br></div>', text: ''},
            },
            {
                deactivated_datetime: null,
                response_message_content: {html: '<div><br></div>', text: ''},
                title: 'label',
            },
        ])
        await waitFor(() =>
            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.QuickResponseFlowCreated,
                {
                    buttonLabel: 'label',
                    responseText: {
                        message: Map({html: '<div><br></div>', text: ''}),
                    },
                }
            )
        )
    })

    it('should prevent creation if another flow has same title', () => {
        const updateQuickReplyPoliciesSpy = jest.fn()
        jest.spyOn(hooks, 'useUpdateQuickReplyPolicies').mockImplementation(
            () => ({updateQuickReplyPolicies: updateQuickReplyPoliciesSpy})
        )
        const {getByText, getByLabelText} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    entities: {
                        ...defaultState.entities,
                        selfServiceConfigurations: {
                            1: {
                                ...defaultState.entities
                                    .selfServiceConfigurations[1],
                                quick_response_policies: [
                                    {
                                        id: 'another-id',
                                        title: 'title',
                                        deactivated_datetime: null,
                                        response_message_content: {
                                            html: '<div><br></div>',
                                            text: '',
                                        },
                                    },
                                ],
                            },
                        },
                    },
                })}
            >
                <QuickResponseFlowNewItem />
            </Provider>
        )

        const saveChangesButton = getByText('Create Flow') as HTMLInputElement

        fireEvent.change(getByLabelText('Button label'), {
            target: {value: 'title'},
        })

        fireEvent.click(saveChangesButton)
        expect(updateQuickReplyPoliciesSpy).not.toHaveBeenCalled()

        fireEvent.change(getByLabelText('Button label'), {
            target: {value: 'another title'},
        })

        fireEvent.click(saveChangesButton)

        expect(updateQuickReplyPoliciesSpy).toHaveBeenCalledWith([
            {
                deactivated_datetime: null,
                id: 'another-id',
                title: 'title',
                response_message_content: {html: '<div><br></div>', text: ''},
            },
            {
                deactivated_datetime: null,
                response_message_content: {html: '<div><br></div>', text: ''},
                title: 'another title',
            },
        ])
    })
})
