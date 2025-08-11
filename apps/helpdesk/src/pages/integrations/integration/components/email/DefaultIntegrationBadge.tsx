import React, { useRef } from 'react'

import { Badge, Tooltip } from '@gorgias/axiom'

function DefaultIntegrationBadge() {
    const badgeRef = useRef<HTMLDivElement>(null)

    return (
        <>
            <Badge ref={badgeRef} id="default-address-badge" type={'blue'}>
                DEFAULT
            </Badge>
            <Tooltip target={badgeRef}>
                This email address is used as the default when creating email
                tickets or switching to the email channel. To remove this as the
                default, you must set another email as the default first.
            </Tooltip>
        </>
    )
}

export default DefaultIntegrationBadge
