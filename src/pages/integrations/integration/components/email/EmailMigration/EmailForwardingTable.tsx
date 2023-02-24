import React from 'react'
import {EmailMigration} from 'models/integration/types'

type Props = {
    migrations: EmailMigration[]
}

export default function EmailForwardingTable({migrations}: Props) {
    return (
        <div>
            {migrations.map((migration) => (
                <div key={migration.integration.id}></div>
            ))}
        </div>
    )
}
