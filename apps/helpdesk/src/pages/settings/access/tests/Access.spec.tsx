import React from 'react'

import { userEvent } from '@repo/testing'
import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    AccountSettingAccessSignupMode,
    AccountSettingType,
} from 'state/currentAccount/types'
import { RootState, StoreDispatch } from 'state/types'

import { AccessContainer } from '../Access'

jest.mock('lodash/uniqueId', () => (id?: string) => `${id || ''}42`)

const accessSettings = fromJS({
    id: 1,
    type: AccountSettingType.Access,
    data: {
        signup_mode: AccountSettingAccessSignupMode.AllowedDomains,
        allowed_domains: ['gorgias.com', 'gorgias.io'],
        custom_sso_providers: {},
    },
})
const accessSettingsOnlyWildcards = fromJS({
    id: 1,
    type: AccountSettingType.Access,
    data: {
        signup_mode: AccountSettingAccessSignupMode.AllowedDomains,
        allowed_domains: ['*.*'],
        custom_sso_providers: {},
    },
})
const accessSettingsDangerousWildcard = fromJS({
    id: 1,
    type: AccountSettingType.Access,
    data: {
        signup_mode: AccountSettingAccessSignupMode.AllowedDomains,
        allowed_domains: ['*gorgias.com'],
        custom_sso_providers: {},
    },
})
const accessSettingsGeneric = fromJS({
    id: 1,
    type: AccountSettingType.Access,
    data: {
        signup_mode: AccountSettingAccessSignupMode.AllowedDomains,
        allowed_domains: ['gmail.com'],
        custom_sso_providers: {},
    },
})

describe('<Access/>', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    it('should render properly', () => {
        const { container } = render(
            <Provider store={mockStore()}>
                <AccessContainer
                    accountDomain="acme"
                    accessSettings={fromJS({
                        data: { custom_sso_providers: {} },
                    })}
                    submitSetting={jest.fn()}
                />
            </Provider>,
        )

        expect(container).toMatchSnapshot()
    })

    it('should render with the previously saved settings', () => {
        const { container } = render(
            <Provider store={mockStore()}>
                <AccessContainer
                    accountDomain="acme"
                    accessSettings={accessSettings}
                    submitSetting={jest.fn()}
                />
            </Provider>,
        )

        expect(container).toMatchSnapshot()
    })

    it('should show an error and block submit when using just wildcards as a domain', () => {
        const { getByText } = render(
            <Provider store={mockStore()}>
                <AccessContainer
                    accountDomain="acme"
                    accessSettings={accessSettingsOnlyWildcards}
                    submitSetting={jest.fn()}
                />
            </Provider>,
        )

        expect(() =>
            getByText('You cannot use only wildcards as a domain.'),
        ).not.toThrow()
    })

    it('should show an error and block submit when using a dangerous sub-domain wildcard', () => {
        const { getByText } = render(
            <Provider store={mockStore()}>
                <AccessContainer
                    accountDomain="acme"
                    accessSettings={accessSettingsDangerousWildcard}
                    submitSetting={jest.fn()}
                />
            </Provider>,
        )

        expect(() =>
            getByText('You cannot use wildcards not separated by a dot.'),
        ).not.toThrow()
    })

    it('should show an error and block submit when using a generic domain', () => {
        const { container } = render(
            <Provider store={mockStore()}>
                <AccessContainer
                    accountDomain="acme"
                    accessSettings={accessSettingsGeneric}
                    submitSetting={jest.fn()}
                />
            </Provider>,
        )

        expect(container).toMatchSnapshot()
    })

    it('should save the settings when the submit button is clicked', () => {
        const submitSetting = jest.fn()
        const { getByText } = render(
            <Provider store={mockStore()}>
                <AccessContainer
                    accountDomain="acme"
                    accessSettings={fromJS({
                        data: { custom_sso_providers: {} },
                    })}
                    submitSetting={submitSetting}
                />
            </Provider>,
        )

        userEvent.click(getByText('Save changes'))

        expect(submitSetting).toHaveBeenCalled()
    })
})
