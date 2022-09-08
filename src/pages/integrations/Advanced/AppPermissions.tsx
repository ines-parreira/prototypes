import React, {useState} from 'react'

import {AppOAuthPermission} from 'config/oauthPermissions'
import ButtonIconLabel from '../../common/components/button/ButtonIconLabel'
import Button from '../../common/components/button/Button'
import AppPermission from './AppPermission'

interface Props {
    permissions: AppOAuthPermission[]
}

export default function AppPermissions({permissions}: Props) {
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
                >
                    <ButtonIconLabel
                        icon={showAll ? 'unfold_less' : 'unfold_more'}
                    >
                        {showAll ? 'Show less' : 'Show all'}
                    </ButtonIconLabel>
                </Button>
            )}
        </>
    )
}
