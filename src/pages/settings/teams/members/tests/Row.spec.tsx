import React from 'react'
import {render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'

import Row from '../Row'

const minProps = {
    member: fromJS({
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
        updated_datetime: '2021-05-06T16:11:10.990319+00:00',
    }) as Map<any, any>,
    isAccountOwner: false,
    deleteTeamMember: jest.fn(),
    select: jest.fn(),
    isSelected: false,
}

describe('<Row />', () => {
    it('should render', () => {
        const {container} = render(<Row {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })
})
