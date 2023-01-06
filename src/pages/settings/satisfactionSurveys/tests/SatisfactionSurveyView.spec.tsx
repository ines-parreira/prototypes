import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {getLDClient} from 'utils/launchDarkly'
import {FeatureFlagKey} from 'config/featureFlags'

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

jest.mock('utils/launchDarkly')
const allFlagsMock = getLDClient().allFlags as jest.Mock
allFlagsMock.mockReturnValue({[FeatureFlagKey.ChatVideoSharingExtra]: true})

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
            const div = document.createElement('div')
            document.body.appendChild(div)
            const component = mount(
                <Provider store={store}>
                    <SatisfactionSurveyView />
                </Provider>,
                {attachTo: div}
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onSubmit', () => {
        it('should submit user data', () => {
            const div = document.createElement('div')
            document.body.appendChild(div)
            const component = mount(
                <Provider store={store}>
                    <SatisfactionSurveyView />
                </Provider>,
                {attachTo: div}
            )

            component.find('form').simulate('submit')

            expect(mockSubmitSetting.mock.calls).toMatchSnapshot()
        })
    })
})
