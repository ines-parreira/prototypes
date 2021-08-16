import React from 'react'
import {render} from '@testing-library/react'
import {LinkProps} from 'react-router-dom'

import StatViewLink from '../StatViewLink'

jest.mock('react-router-dom', () => ({
    Link: (props: LinkProps) => (
        <div>
            Link Mock
            {JSON.stringify(props, null, 2)}
        </div>
    ),
}))

describe('StatViewLink', () => {
    it('should render the component and construct the link for the new view', () => {
        const viewName = `Assigned to: Acme Support`
        const filters = [
            {left: 'ticket.assignee_user.id', operator: 'eq', right: 8},
        ]

        const {container} = render(
            <StatViewLink viewName={viewName} filters={filters}>
                click here!
            </StatViewLink>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
