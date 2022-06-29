import React from 'react'
import {render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'

import {RowContainer} from '../Row'

jest.mock('pages/common/components/button/ConfirmButton', () => () => (
    <div>delete</div>
))

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
    currentPage: 1,
    isAccountOwner: false,
    deleteAgent: jest.fn(),
    fetchAgents: jest.fn(),
    last: false,
}

describe('<Row />', () => {
    it('should render', () => {
        const {container} = render(<RowContainer {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a user without a name', () => {
        const {container} = render(
            <RowContainer
                {...minProps}
                agent={minProps.agent.set('name', null)}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render 2FA information when enabled', () => {
        const {container} = render(<RowContainer {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render 2FA information when enabled and agent has 2FA disabled', () => {
        const {container} = render(
            <RowContainer
                {...minProps}
                agent={minProps.agent.set('has_2fa_enabled', false)}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
