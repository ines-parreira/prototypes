import {fromJS} from 'immutable'
import React from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    AccountSettingAccessSignupMode,
    AccountSettingType,
} from '../../../../state/currentAccount/types.ts'

import {AccessContainer} from '../Access.tsx'

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
    it('should render properly', () => {
        const {container} = render(
            <AccessContainer accountDomain="acme" accessSettings={fromJS({})} />
        )

        expect(container).toMatchSnapshot()
    })

    it('should render with the previously saved settings', () => {
        const {container} = render(
            <AccessContainer
                accountDomain="acme"
                accessSettings={accessSettings}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('should show an error and block submit when using a generic domain', () => {
        const {container} = render(
            <AccessContainer
                accountDomain="acme"
                accessSettings={accessSettingsGeneric}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('should save the settings when the submit button is clicked', () => {
        const submitSetting = jest.fn()
        const {getByText} = render(
            <AccessContainer
                accountDomain="acme"
                accessSettings={fromJS({})}
                submitSetting={submitSetting}
            />
        )

        userEvent.click(getByText('Save changes'))

        expect(submitSetting).toHaveBeenCalled()
    })
})
