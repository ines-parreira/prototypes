import React from 'react'

import { render } from '@testing-library/react'

import { oauthPermissions } from 'config/oauthPermissions'
import AppPermission from 'pages/integrations/Advanced/AppPermission'

describe(`AppPermission`, () => {
    it('should render', () => {
        const { container } = render(
            <AppPermission
                {...oauthPermissions.account}
                verbs={['read', 'write']}
            />,
        )
        expect(container).toMatchSnapshot()
    })
})
