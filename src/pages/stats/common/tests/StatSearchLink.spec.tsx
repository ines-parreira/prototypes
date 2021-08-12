import React from 'react'
import {render} from '@testing-library/react'
import {LinkProps} from 'react-router-dom'

import StatSearchLink from '../StatSearchLink'

jest.mock('react-router-dom', () => ({
    Link: (props: LinkProps) => (
        <div>
            Link Mock
            {JSON.stringify(props, null, 2)}
        </div>
    ),
}))

describe('StatSearchLink', () => {
    it('should render the component and construct the link for the new view', () => {
        const viewName = `Assigned to: Acme Support`
        const filters = [
            {left: 'ticket.assignee_user.id', operator: 'eq', right: 8},
        ]

        const {container} = render(
            <StatSearchLink viewName={viewName} filters={filters}>
                click here!
            </StatSearchLink>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
