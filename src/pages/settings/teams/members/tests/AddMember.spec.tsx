import React, {ComponentProps} from 'react'
import {render, fireEvent} from '@testing-library/react'
import {fromJS, List} from 'immutable'

import {AddMemberContainer} from '../AddMember'

const minProps = {
    team: fromJS({
        id: 1,
        uri: '/api/teams/1/',
        name: 'test',
        description: null,
        decoration: {},
        members: [
            {
                id: 1,
                name: 'Acme Support',
                email: 'hello@acme.gorgias.io',
                meta: {},
            },
        ],
        created_datetime: '2021-05-06T16:19:31.936074+00:00',
    }),
    users: fromJS([
        {
            lastname: 'Support',
            meta: {},
            active: true,
            bio: null,
            deactivated_datetime: null,
            name: 'Acme Support',
            external_id: '1',
            created_datetime: '2021-05-06T16:11:10.987395+00:00',
            country: null,
            language: null,
            timezone: 'US/Pacific',
            id: 1,
            firstname: 'Acme',
            email: 'hello@acme.gorgias.io',
            role: {
                id: 7,
                name: 'admin',
            },
            updated_datetime: '2021-05-06T16:11:10.990319+00:00',
        },
        {
            lastname: 'Plugaru',
            meta: {
                last_phone_call_ended_at: '2000-02-28T00:00:00',
            },
            active: true,
            bio: null,
            deactivated_datetime: null,
            name: 'Alex Plugaru',
            external_id: '2',
            created_datetime: '2021-05-06T16:11:13.958600+00:00',
            country: 'US',
            language: 'en',
            timezone: 'EST',
            id: 2,
            firstname: 'Alex',
            email: 'alex@gorgias.io',
            role: {
                id: 7,
                name: 'admin',
            },
            updated_datetime: '2021-05-06T16:11:13.959994+00:00',
        },
    ]) as List<any>,
    addTeamMember: jest.fn(),
} as unknown as ComponentProps<typeof AddMemberContainer>

describe('<AddMember />', () => {
    it('should render', () => {
        const {container} = render(<AddMemberContainer {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the dropdown on click', async () => {
        const {findByText, getByText} = render(
            <AddMemberContainer {...minProps} />
        )

        fireEvent.click(getByText(/Add team member/i))
        const element = await findByText(/Alex/i)
        expect(element.closest('.dropdown-menu')).toMatchSnapshot()
    })

    it('should render user with empty name', async () => {
        const {findByText, getByText} = render(
            <AddMemberContainer
                {...minProps}
                users={minProps.users.setIn([1, 'name'], null)}
            />
        )

        fireEvent.click(getByText(/Add team member/i))
        const element = await findByText(/alex@gorgias.io/i)
        expect(element.closest('.dropdown-menu')).toMatchSnapshot()
    })
})
