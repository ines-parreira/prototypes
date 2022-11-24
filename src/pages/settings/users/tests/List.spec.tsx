import {render, screen} from '@testing-library/react'
import React from 'react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {account} from 'fixtures/account'
import {agents} from 'fixtures/agents'
import {RootState, StoreDispatch} from 'state/types'

import UserList from '../List'

jest.mock('models/agents/resources', () => ({
    fetchAgents: jest.fn(() => () => ({})),
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const accessSettings = {
    id: 5,
    account_id: 1,
    type: 'access',
    data: {
        signup_mode: 'invite',
        google_sso_enabled: false,
        office365_sso_enabled: false,
    },
    allowed_domains: ['*.gorgias.com', 'gorgias.com', 'yahoo.com'],
}

describe('<List />', () => {
    const defaultState = {
        agents: fromJS({
            all: agents,
            pagination: agents,
        }),
        currentAccount: fromJS({
            ...account,
            settings: [accessSettings],
        }),
    } as RootState

    it('should render', async () => {
        const {container, findByText} = render(
            <Provider store={mockStore(defaultState)}>
                <UserList />
            </Provider>
        )
        await findByText('Add user')
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render without access settings alert', async () => {
        const state = {
            ...defaultState,
            currentAccount: fromJS({
                settings: [
                    {
                        ...accessSettings,
                        data: {
                            ...accessSettings.data,
                            signup_mode: 'allowed-domains',
                        },
                    },
                ],
                user_id: 1,
            }),
        }

        const {findByText} = render(
            <Provider store={mockStore(state)}>
                <UserList />
            </Provider>
        )
        await findByText('Add user')
        expect(
            screen.queryByText(
                "You can also allow members to sign up using your company's email domain."
            )
        ).toBeNull()
    })
})
