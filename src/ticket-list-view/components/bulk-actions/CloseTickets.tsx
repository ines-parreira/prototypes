import React from 'react'

import IconButton from 'pages/common/components/button/IconButton'

import css from './BulkActions.less'

export default function CloseTickets({
    isDisabled,
    onClick,
}: {
    onClick: () => void
    isDisabled: boolean
}) {
    return (
        <IconButton
            className={css.button}
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
