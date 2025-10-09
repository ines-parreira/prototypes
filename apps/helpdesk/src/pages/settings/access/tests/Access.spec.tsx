import React from 'react'

import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

jest.mock('core/flags', () => ({
    useFlag: jest.fn().mockReturnValue(true),
}))

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
    const createMockStore = configureMockStore<
        Partial<RootState>,
        StoreDispatch
    >([thunk])

    // Create a complete mock state with all required data
    const mockState = {
        billing: fromJS({
            products: [
                {
                    type: 'helpdesk',
                    prices: [
                        {
                            plan_id: '0',
                            name: 'Enterprise',
                            custom: false,
                            amount: 100000,
                            cadence: 'month',
                            currency: 'usd',
                            extra_ticket_cost: 0.5,
                            num_quota_tickets: 10000,
                            integrations: 200,
                            is_legacy: false,
                            features: {},
                            tier: 'Enterprise',
                            product: 'helpdesk',
                            price_id: 'price_enterprise',
                            public: true,
                        },
                    ],
                },
            ],
        }),
        currentAccount: fromJS({
            subscription: {
                products: {
                    helpdesk: '0', // Enterprise plan ID
                },
            },
        }),
        currentUser: fromJS({
            id: 1,
            email: 'test@example.com',
            role: { name: 'Admin' },
            timezone: 'America/New_York',
            has2FaEnabled: false,
        }),
    }

    const mockStore = () => createMockStore(mockState)

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

    it('should save the settings when the submit button is clicked', async () => {
        const user = userEvent.setup()
        const submitSetting = jest.fn().mockResolvedValue({
            type: 'UPDATE_ACCOUNT_SETTING',
        })
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

        await user.click(getByText('Save changes'))

        expect(submitSetting).toHaveBeenCalled()
    })
})
