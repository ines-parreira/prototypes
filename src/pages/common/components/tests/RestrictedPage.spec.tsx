import React from 'react'
import {render} from '@testing-library/react'

import {PageSection} from 'config/pages'
import {UserRole} from 'config/types/user'

import RestrictedPage from '../RestrictedPage'

describe('<RestrictedPage/>', () => {
    it.each(Object.values(UserRole))(
        'should render for %s role and include higher permission roles',
        (role) => {
            const {container} = render(<RestrictedPage requiredRole={role} />)
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it('should render for a specific page', () => {
        const {container} = render(
            <RestrictedPage
                requiredRole={UserRole.Admin}
                page={PageSection.Billing}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
