import React from 'react'

import { render } from '@repo/testing'

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
