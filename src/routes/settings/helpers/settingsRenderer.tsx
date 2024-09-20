import React from 'react'

import App from 'pages/App'
import withUserRoleRequired from 'pages/common/utils/withUserRoleRequired'
import SettingsNavbar from 'pages/settings/common/SettingsNavbar/SettingsNavbar'

export function renderer(...settings: Parameters<typeof withUserRoleRequired>) {
    return () => (
        <App
            content={withUserRoleRequired(...settings)}
            navbar={SettingsNavbar}
        />
    )
}
