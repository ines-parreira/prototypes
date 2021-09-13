import React from 'react'
import {render} from '@testing-library/react'
import {LinkProps} from 'react-router-dom'

import ViewLink from '../ViewLink'

jest.mock('react-router-dom', () => ({
    Link: (props: LinkProps) => (
        <div>
            Link Mock
            {JSON.stringify(props, null, 2)}
        </div>
    ),
}))

describe('ViewLink', () => {
    it('should render the component and construct the link for the new view', () => {
        const viewName = `Assigned to: Acme Support`
        const filters = [
            {left: 'ticket.assignee_user.id', operator: 'eq', right: 8},
        ]

        const {container} = render(
            <ViewLink viewName={viewName} filters={filters} className="foo">
                click here!
            </ViewLink>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
