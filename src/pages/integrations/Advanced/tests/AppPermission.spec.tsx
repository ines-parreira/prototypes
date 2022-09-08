import React from 'react'
import {render} from '@testing-library/react'

import AppPermission from 'pages/integrations/Advanced/AppPermission'
import {oauthPermissions} from 'config/oauthPermissions'

describe(`AppPermission`, () => {
    it('should render', () => {
        const {container} = render(
            <AppPermission
                {...oauthPermissions.account}
                verbs={['read', 'write']}
            />
        )
        expect(container).toMatchSnapshot()
    })
})
