import React from 'react'

import IconButton from 'pages/common/components/button/IconButton'

export default function CloseTickets({
    isDisabled,
    onClick,
}: {
    onClick: () => void
    isDisabled: boolean
}) {
    return (
        <IconButton
            size="small"
            fillStyle="ghost"
            intent="secondary"
            onClick={onClick}
            isDisabled={isDisabled}
            title="Close tickets"
        >
            check_circle
        </IconButton>
    )
}
