import React, { useState } from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import type { AppOAuthPermission } from 'config/oauthPermissions'

import AppPermission from './AppPermission'

interface Props {
    permissions: AppOAuthPermission[]
}

export default function AppPermissions({ permissions }: Props) {
    const [showAll, setShowAll] = useState(false)

    if (permissions.length === 0) {
        return <p>This application does not have any permission.</p>
    }

    const shownPermissions = showAll ? permissions : permissions.slice(0, 5)
    return (
        <>
            <div>
                {shownPermissions.map((permission, index) => (
                    <AppPermission key={index} {...permission} />
                ))}
            </div>

            {permissions.length > 5 && (
                <Button
                    fillStyle="ghost"
                    onClick={() => setShowAll(!showAll)}
                    className="mt-2"
                    leadingIcon={showAll ? 'unfold_less' : 'unfold_more'}
                >
                    {showAll ? 'Show less' : 'Show all'}
                </Button>
            )}
        </>
    )
}
