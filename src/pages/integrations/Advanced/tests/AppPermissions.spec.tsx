import React from 'react'
import {render} from '@testing-library/react'

import AppPermissions from 'pages/integrations/Advanced/AppPermissions'
import {AppOAuthPermission, oauthPermissions} from 'config/oauthPermissions'

describe(`AppErrorRow`, () => {
    it('should render', () => {
        const permissions: AppOAuthPermission[] = [
            {...oauthPermissions.account, verbs: ['read']},
            {...oauthPermissions.users, verbs: ['read', 'write']},
        ]

        const {container} = render(<AppPermissions permissions={permissions} />)
        expect(container).toMatchSnapshot()
    })

    it('should hide permissions if there are more than 5', () => {
        const permissions: AppOAuthPermission[] = [
            {...oauthPermissions.account, verbs: ['read']},
            {...oauthPermissions.users, verbs: ['read', 'write']},
            {...oauthPermissions.customers, verbs: ['write']},
            {...oauthPermissions.tickets, verbs: ['read']},
            {...oauthPermissions.events, verbs: ['read']},
            {...oauthPermissions.integrations, verbs: ['read']},
            {...oauthPermissions.jobs, verbs: ['read']},
        ]

        const {container} = render(<AppPermissions permissions={permissions} />)
        expect(container).toMatchSnapshot()
    })
})
