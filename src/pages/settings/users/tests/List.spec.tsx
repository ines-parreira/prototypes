import {render, screen} from '@testing-library/react'
import React from 'react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {RootState, StoreDispatch} from 'state/types'
import {agents} from 'fixtures/agents'
import {UserListContainer} from '../List'

const mockStore = configureMockStore<RootState, StoreDispatch>()

const pagination = {
    data: agents,
    meta: {
        page: 1,
        per_page: 30,
        current_page:
            '/api/users/?page=1&roles%5B%5D=admin&roles%5B%5D=agent&roles%5B%5D=basic-agent&roles%5B%5D=lite-agent&roles%5B%5D=observer-agent',
        item_count: 3,
        nb_pages: 1,
        data: agents,
    },
}
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

const minProps = {
    agents: fromJS(agents),
    pagination: fromJS(pagination.meta),
    accountOwnerId: 1,
    accessSettings: fromJS(accessSettings),
    getPaginatedAgents: jest.fn(),
    getPagination: jest.fn(),
    getAccessSettings: jest.fn(),
    fetchAgents: jest.fn(() => Promise.resolve(agents)),
}

describe('<List />', () => {
    const defaultState = {
        agents: fromJS({
            all: agents,
            pagination: pagination,
        }),
        currentAccount: fromJS({settings: [accessSettings], user_id: 1}),
    } as RootState
    it('should render', async () => {
        const {container, findByText} = render(
            <Provider store={mockStore(defaultState)}>
                <UserListContainer {...minProps} />
            </Provider>
        )
        await findByText('Add user')
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render without access settings alert', async () => {
        accessSettings.data.signup_mode = 'allowed-domains'
        const {findByText} = render(
            <Provider store={mockStore(defaultState)}>
                <UserListContainer
                    {...minProps}
                    accessSettings={fromJS(accessSettings)}
                />
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
