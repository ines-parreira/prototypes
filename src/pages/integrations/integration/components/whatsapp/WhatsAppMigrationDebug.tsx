import React from 'react'

import useWhatsAppMigration from 'hooks/useWhatsAppMigration'
import SettingsContent from 'pages/settings/SettingsContent'

export default function WhatsAppMigrationVerificationForm(): JSX.Element | null {
    const migration = useWhatsAppMigration()

    return (
        <SettingsContent className="mt-5 p-4">
            <h4>DEBUG</h4>
            <strong>status</strong>
            <br />
            <span>{migration.status}</span>
            <br />
            <strong>target</strong>
            <br />
            <span>{JSON.stringify(migration.target)}</span>
            <br />
            <strong>progress</strong>
            <br />
            <span>{JSON.stringify(migration.progress)}</span>
        </SettingsContent>
    )
}
