import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {createBrowserHistory, createLocation} from 'history'

import {FormContainer} from '../Form'

jest.mock('lodash/uniqueId', () => (id?: string) => `${id || ''}42`)

const agent = {
    id: 2,
    name: 'Acme Support',
    email: 'hello@acme.gorgias.io',
    roles: [
        {
            id: 7,
            name: 'admin',
        },
    ],
    has_2fa_enabled: true,
}
const minProps = {
    agentId: agent.id,
    accountDomain: 'test',
    accountOwnerId: 1,
    currentUserId: 1,

    createAgent: jest.fn(),
    deleteAgent: jest.fn(),
    fetchAgent: () => Promise.resolve(fromJS(agent)),
    inviteAgent: jest.fn(),
    updateAgent: jest.fn(),
    updateAccountOwner: jest.fn(),

    history: createBrowserHistory(),
    location: createLocation('/'),
    match: undefined as any,
}

describe('<Form />', () => {
    it('should render', async () => {
        const {container, findByText} = render(<FormContainer {...minProps} />)
        await findByText('Save user')

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with 2FA information when enabled', async () => {
        const {container, findByText} = render(<FormContainer {...minProps} />)
        await findByText('Reset 2FA Token')

        expect(container.firstChild).toMatchSnapshot()
    })
})
