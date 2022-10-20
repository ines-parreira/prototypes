import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS, List, Map} from 'immutable'
import MockDate from 'mockdate'
import {useParams, useRouteMatch} from 'react-router-dom'

import {RootState, StoreDispatch} from 'state/types'
import {user} from 'fixtures/users'

import FlowSelfServicePreview from '../FlowSelfServicePreview'
import {defaultState} from '../../QuickResponseFlowsPreferences/tests/constants'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const useParamsMock = useParams as jest.MockedFunction<typeof useParams>
const useRouteMatchMock = useRouteMatch as jest.MockedFunction<
    typeof useRouteMatch
>
jest.mock('react-router')

const quickResponseMessage = Map({text: 'text', html: 'response'}) as Map<
    any,
    any
>

describe('<ChatIntegrationPreview/>', () => {
    const date = '2021-01-24T17:30:00.000Z'
    const state = {
        ...defaultState,
        currentUser: fromJS(user),
    }

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

    describe('render()', () => {
        it('displays landing page', () => {
            const {container, getByText} = render(
                <Provider store={mockStore(state)}>
                    <FlowSelfServicePreview
                        message="question"
                        responseMessage={quickResponseMessage}
                        newMessageAttachments={List()}
                        isLandingPage={true}
                        setIsLandingPage={jest.fn()}
                        isQuickResponsePreview
                        showHelpfulPrompt
                    />
                </Provider>
            )

            getByText('Quick answers')
            getByText('question')

            expect(container).toMatchSnapshot()
        })

        it('displays thread page with answer', () => {
            const {container, getByText} = render(
                <Provider store={mockStore(state)}>
                    <FlowSelfServicePreview
                        message="question"
                        responseMessage={quickResponseMessage}
                        newMessageAttachments={List()}
                        isLandingPage={false}
                        setIsLandingPage={jest.fn()}
                        showHelpfulPrompt
                    />
                </Provider>
            )

            getByText('response')

            expect(container).toMatchSnapshot()
        })

        it('displays thread page with answer without prompt', () => {
            const {container, getByText} = render(
                <Provider store={mockStore(state)}>
                    <FlowSelfServicePreview
                        message="question"
                        responseMessage={quickResponseMessage}
                        newMessageAttachments={List()}
                        isLandingPage={false}
                        setIsLandingPage={jest.fn()}
                    />
                </Provider>
            )

            getByText('response')
            getByText('Type a message...')

            expect(container).toMatchSnapshot()
        })

        it('displays thread page without answer', () => {
            const {container, getByText} = render(
                <Provider store={mockStore(state)}>
                    <FlowSelfServicePreview
                        responseMessage={
                            Map({text: '', html: ''}) as Map<any, any>
                        }
                        message="question"
                        newMessageAttachments={List()}
                        isLandingPage={false}
                        setIsLandingPage={jest.fn()}
                        isQuickResponsePreview
                        showHelpfulPrompt
                    />
                </Provider>
            )

            getByText('Type a message...')

            expect(container).toMatchSnapshot()
        })
    })
})
