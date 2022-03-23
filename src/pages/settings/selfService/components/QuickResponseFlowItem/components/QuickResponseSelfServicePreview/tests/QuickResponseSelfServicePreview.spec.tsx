import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import MockDate from 'mockdate'
import {useParams, useRouteMatch} from 'react-router-dom'

import {RootState, StoreDispatch} from 'state/types'
import {user} from 'fixtures/users'

import QuickResponseSelfServicePreview from '../QuickResponseSelfServicePreview'
import {defaultState} from '../../../../QuickResponseFlowsPreferences/tests/constants'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const useParamsMock = useParams as jest.MockedFunction<typeof useParams>
const useRouteMatchMock = useRouteMatch as jest.MockedFunction<
    typeof useRouteMatch
>
jest.mock('react-router')

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
                    <QuickResponseSelfServicePreview
                        quickResponseResponse="response"
                        quickResponseTitle="question"
                    />
                </Provider>
            )

            getByText('Quick answers')
            getByText('question')

            expect(container).toMatchSnapshot()
        })

        it('displays thread page', () => {
            const {container, getByText} = render(
                <Provider store={mockStore(state)}>
                    <QuickResponseSelfServicePreview
                        quickResponseResponse="response"
                        quickResponseTitle="question"
                    />
                </Provider>
            )

            fireEvent.click(getByText('Message Thread'))
            getByText('response')

            expect(container).toMatchSnapshot()
        })
    })
})
