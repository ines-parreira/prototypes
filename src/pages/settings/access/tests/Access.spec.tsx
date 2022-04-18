import {fromJS} from 'immutable'
import React from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {RootState, StoreDispatch} from 'state/types'
import {
    AccountSettingAccessSignupMode,
    AccountSettingType,
} from 'state/currentAccount/types'
import {AccessContainer} from '../Access'

jest.mock('lodash/uniqueId', () => (id: string) => `${id}42`)

const accessSettings = fromJS({
    id: 1,
    type: AccountSettingType.Access,
    data: {
        signup_mode: AccountSettingAccessSignupMode.AllowedDomains,
        allowed_domains: ['gorgias.com', 'gorgias.io'],
    },
})
const accessSettingsGeneric = fromJS({
    id: 1,
    type: AccountSettingType.Access,
    data: {
        signup_mode: AccountSettingAccessSignupMode.AllowedDomains,
        allowed_domains: ['gmail.com'],
    },
})

describe('<Access/>', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    it('should render properly', () => {
        const {container} = render(
            <Provider store={mockStore()}>
                <AccessContainer
                    accountDomain="acme"
                    accessSettings={fromJS({})}
                    submitSetting={jest.fn()}
                />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render with the previously saved settings', () => {
        const {container} = render(
            <Provider store={mockStore()}>
                <AccessContainer
                    accountDomain="acme"
                    accessSettings={accessSettings}
                    submitSetting={jest.fn()}
                />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should show an error and block submit when using a generic domain', () => {
        const {container} = render(
            <Provider store={mockStore()}>
                <AccessContainer
                    accountDomain="acme"
                    accessSettings={accessSettingsGeneric}
                    submitSetting={jest.fn()}
                />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should save the settings when the submit button is clicked', () => {
        const submitSetting = jest.fn()
        const {getByText} = render(
            <Provider store={mockStore()}>
                <AccessContainer
                    accountDomain="acme"
                    accessSettings={fromJS({})}
                    submitSetting={submitSetting}
                />
            </Provider>
        )

        userEvent.click(getByText('Save changes'))

        expect(submitSetting).toHaveBeenCalled()
    })
})
