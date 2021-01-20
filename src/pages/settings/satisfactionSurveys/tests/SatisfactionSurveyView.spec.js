import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import SatisfactionSurveyView from '../SatisfactionSurveyView'

const mockSubmitSetting = jest.fn()
const mockStore = configureMockStore([thunk])

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => 'someRandomKey')

describe('SatisfactionSurveyView', () => {
    let store = null
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
        })
        jest.clearAllMocks()
    })

    describe('render', () => {
        it('should render current survey settings form', () => {
            const component = mount(
                <SatisfactionSurveyView
                    store={store}
                    submitSetting={jest.fn()}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onSubmit', () => {
        it('should submit user data', () => {
            const component = mount(
                <SatisfactionSurveyView
                    store={store}
                    submitSetting={mockSubmitSetting}
                />
            )

            component.find('form').simulate('submit')

            expect(mockSubmitSetting.mock.calls).toMatchSnapshot()
        })
    })
})
