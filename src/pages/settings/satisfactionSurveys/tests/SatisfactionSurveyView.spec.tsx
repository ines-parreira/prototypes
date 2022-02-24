import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from 'state/types'
import {submitSetting} from 'state/currentAccount/actions'

import SatisfactionSurveyView from '../SatisfactionSurveyView'

const mockSubmitSetting = jest.fn()
type MockedRootState = {
    currentAccount: RootState
    submitSetting: typeof submitSetting
}
const mockStore = configureMockStore<MockedRootState, StoreDispatch>([thunk])

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => 'someRandomKey')

describe('SatisfactionSurveyView', () => {
    let store: MockStoreEnhanced
    beforeEach(() => {
        store = mockStore({
            currentAccount: fromJS({
                settings: [
                    {
                        data: {},
                        type: 'satisfaction-surveys',
                    },
                ],
            }),
            submitSetting: mockSubmitSetting,
        })
        jest.clearAllMocks()
    })

    describe('render', () => {
        it('should render current survey settings form', () => {
            const component = mount(
                <Provider store={store}>
                    <SatisfactionSurveyView />
                </Provider>
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onSubmit', () => {
        it('should submit user data', () => {
            const component = mount(
                <Provider store={store}>
                    <SatisfactionSurveyView />
                </Provider>
            )

            component.find('form').simulate('submit')

            expect(mockSubmitSetting.mock.calls).toMatchSnapshot()
        })
    })
})
