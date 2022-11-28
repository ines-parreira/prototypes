import React from 'react'
import {Provider} from 'react-redux'
import {useParams, useRouteMatch} from 'react-router-dom'
import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import thunk from 'redux-thunk'
import MockDate from 'mockdate'
import {fromJS, List, Map} from 'immutable'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'
import {account} from 'fixtures/account'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'

import history from '../../../../../history'
import QuickResponseFlowEditItem from '../QuickResponseFlowEditItem'
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

const entitiesInitialState = {
    ...defaultState.entities,
    selfServiceConfigurations: {
        1: {
            ...defaultState.entities.selfServiceConfigurations[1],
            quick_response_policies: [
                {
                    id: 'some-id',
                    title: 'title',
                    deactivated_datetime: null,
                    response_message_content: {
                        html: '<div><br></div>',
                        text: '',
                        attachments: List(),
                    },
                },
                {
                    id: 'another-id',
                    title: 'another title',
                    deactivated_datetime: null,
                    response_message_content: {
                        html: '<div><br></div>',
                        text: '',
                        attachments: List(),
                    },
                },
            ],
        },
    },
}

describe('<QuickResponseFlowEditItem />', () => {
    const date = '2021-01-24T17:30:00.000Z'

    beforeEach(() => {
        useParamsMock.mockReturnValue({
            shopName: 'mystore1',
            integrationType: 'shopify',
            quickResponseId: 'some-id',
        })
        useRouteMatchMock.mockReturnValue({
            params: {
                shopName: 'mystore1',
                integrationType: 'shopify',
                quickResponseId: 'some-id',
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
                    status: 'active',
                },
            }),
            entities: entitiesInitialState,
        }

        render(
            <Provider store={mockStore(state)}>
                <QuickResponseFlowEditItem />
            </Provider>
        )

        screen.getByText('Get advanced automation features')
    })

    it('should edit existing flow', async () => {
        const updateQuickReplyPoliciesSpy = jest.fn()
        jest.spyOn(hooks, 'useUpdateQuickReplyPolicies').mockImplementation(
            () => ({updateQuickReplyPolicies: updateQuickReplyPoliciesSpy})
        )

        const {getByText, getByLabelText} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    entities: entitiesInitialState,
                })}
            >
                <QuickResponseFlowEditItem />
            </Provider>
        )

        getByText('Back to quick response flows')
        const saveChangesButton = getByText('Save Changes') as HTMLInputElement

        fireEvent.change(getByLabelText('Quick response prompt'), {
            target: {value: 'label'},
        })

        fireEvent.click(saveChangesButton)

        expect(updateQuickReplyPoliciesSpy).toHaveBeenCalledWith({
            message: 'Flow successfully updated',
            newQuickRepliesPolicy: [
                {
                    deactivated_datetime: null,
                    response_message_content: {
                        html: '<div><br></div>',
                        text: '',
                        attachments: List(),
                    },
                    title: 'label',
                    id: 'some-id',
                },
                {
                    deactivated_datetime: null,
                    id: 'another-id',
                    title: 'another title',
                    response_message_content: {
                        html: '<div><br></div>',
                        text: '',
                        attachments: List(),
                    },
                },
            ],
        })
        await waitFor(() =>
            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.QuickResponseFlowEdited,
                {
                    buttonLabel: 'label',
                    responseText: {
                        message: Map({
                            html: '<div><br></div>',
                            text: '',
                            attachments: List(),
                        }),
                    },
                    id: 'some-id',
                    attachments: List(),
                }
            )
        )
    })

    it('should prevent edition if another flow has same title', () => {
        const updateQuickReplyPoliciesSpy = jest.fn()
        jest.spyOn(hooks, 'useUpdateQuickReplyPolicies').mockImplementation(
            () => ({updateQuickReplyPolicies: updateQuickReplyPoliciesSpy})
        )
        const {getByText, getByLabelText} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    entities: entitiesInitialState,
                })}
            >
                <QuickResponseFlowEditItem />
            </Provider>
        )

        const saveChangesButton = getByText('Save Changes') as HTMLInputElement

        fireEvent.change(getByLabelText('Quick response prompt'), {
            target: {value: 'another title'},
        })

        fireEvent.click(saveChangesButton)
        expect(updateQuickReplyPoliciesSpy).not.toHaveBeenCalled()
    })

    it('should allow edition if flow title was not changed', async () => {
        const updateQuickReplyPoliciesSpy = jest.fn()
        jest.spyOn(hooks, 'useUpdateQuickReplyPolicies').mockImplementation(
            () => ({updateQuickReplyPolicies: updateQuickReplyPoliciesSpy})
        )
        const {getByText} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    entities: entitiesInitialState,
                })}
            >
                <QuickResponseFlowEditItem />
            </Provider>
        )

        const saveChangesButton = getByText('Save Changes') as HTMLInputElement

        fireEvent.click(saveChangesButton)

        expect(updateQuickReplyPoliciesSpy).toHaveBeenCalledWith({
            message: 'Flow successfully updated',
            newQuickRepliesPolicy: [
                {
                    deactivated_datetime: null,
                    title: 'title',
                    id: 'some-id',
                    response_message_content: {
                        html: '<div><br></div>',
                        text: '',
                        attachments: List(),
                    },
                },
                {
                    deactivated_datetime: null,
                    response_message_content: {
                        html: '<div><br></div>',
                        text: '',
                        attachments: List(),
                    },
                    title: 'another title',
                    id: 'another-id',
                },
            ],
        })
        await waitFor(() =>
            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.QuickResponseFlowEdited,
                {
                    buttonLabel: 'title',
                    responseText: {
                        message: Map({
                            html: '<div><br></div>',
                            text: '',
                            attachments: List(),
                        }),
                    },
                    id: 'some-id',
                    attachments: List(),
                }
            )
        )
    })

    it('should delete existing flow', async () => {
        const updateQuickReplyPoliciesSpy = jest.fn()
        jest.spyOn(hooks, 'useUpdateQuickReplyPolicies').mockImplementation(
            () => ({updateQuickReplyPolicies: updateQuickReplyPoliciesSpy})
        )
        const {getByText} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    entities: entitiesInitialState,
                })}
            >
                <QuickResponseFlowEditItem />
            </Provider>
        )

        fireEvent.click(getByText('Delete Flow'))
        getByText('Are you sure you want to delete this quick response flow?')
        fireEvent.click(getByText('Delete'))

        expect(updateQuickReplyPoliciesSpy).toHaveBeenCalledWith({
            message: 'Flow successfully deleted',
            newQuickRepliesPolicy: [
                {
                    deactivated_datetime: null,
                    response_message_content: {
                        html: '<div><br></div>',
                        text: '',
                        attachments: List(),
                    },
                    title: 'another title',
                    id: 'another-id',
                },
            ],
        })

        expect(history.push).toHaveBeenLastCalledWith(
            '/app/settings/self-service/shopify/mystore1/preferences/quick-response'
        )
        await waitFor(() =>
            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.QuickResponseFlowDeleted,
                {id: 'some-id'}
            )
        )
    })
})
