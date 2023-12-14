import React from 'react'
import {fromJS} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {render} from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import {RootState, StoreDispatch} from 'state/types'
import {submitSetting} from 'state/currentAccount/actions'
import {integrationsState} from 'fixtures/integrations'

import SatisfactionSurveyView from '../SatisfactionSurveyView'

const mockSubmitSetting = jest.fn()
type MockedRootState = {
    currentAccount: RootState
    submitSetting: typeof submitSetting
    integrations: RootState
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
            integrations: fromJS(integrationsState),
        })
    })

    describe('render', () => {
        it('should render current survey settings form', () => {
            const div = document.createElement('div')
            document.body.appendChild(div)
            const {container} = render(
                <Provider store={store}>
                    <SatisfactionSurveyView />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('_onSubmit', () => {
        it('should submit user data', () => {
            const div = document.createElement('div')
            document.body.appendChild(div)
            const {getByText} = render(
                <Provider store={store}>
                    <SatisfactionSurveyView />
                </Provider>
            )

            userEvent.click(getByText(/Save/))

            expect(mockSubmitSetting.mock.calls).toMatchSnapshot()
        })
    })
})
