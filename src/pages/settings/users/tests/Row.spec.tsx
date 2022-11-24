import React from 'react'
import {render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {agents} from 'fixtures/agents'
import {RootState, StoreDispatch} from 'state/types'
import Row from '../Row'

jest.mock('pages/common/components/button/ConfirmButton', () => () => (
    <div>delete</div>
))

jest.mock('state/agents/actions', () => ({
    deleteAgent: jest.fn(() => () => ({})),
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const minProps = {
    agent: fromJS({
        lastname: 'Support',
        meta: {},
        active: true,
        bio: null,
        deactivated_datetime: null,
        data: null,
        name: 'Acme Support',
        external_id: '1',
        created_datetime: '2021-05-06T16:11:10.987395+00:00',
        id: 1,
        firstname: 'Acme',
        email: 'hello@acme.gorgias.io',
        role: {
            id: 7,
            name: 'admin',
        },
        has_2fa_enabled: true,
        updated_datetime: '2021-05-06T16:11:10.990319+00:00',
    }) as Map<any, any>,
    refreshData: jest.fn(),
    isAccountOwner: false,
}

describe('<Row />', () => {
    const defaultState = {
        agents: fromJS({
            all: agents,
            pagination: agents,
        }),
    } as RootState

    it('should render', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <Row {...minProps} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a user without a name', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <Row {...minProps} agent={minProps.agent.set('name', null)} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render 2FA information when enabled', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <Row {...minProps} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render 2FA information when enabled and agent has 2FA disabled', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <Row
                    {...minProps}
                    agent={minProps.agent.set('has_2fa_enabled', false)}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
