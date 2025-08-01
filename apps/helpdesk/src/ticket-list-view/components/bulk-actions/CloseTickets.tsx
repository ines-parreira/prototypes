import { useRef } from 'react'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import IconButton from 'pages/common/components/button/IconButton'

import css from './style.less'

export default function CloseTickets({
    isDisabled,
    onClick,
}: {
    onClick: () => void
    isDisabled: boolean
}) {
    const ref = useRef(null)

    return (
        <>
            <IconButton
                ref={ref}
                className={css.button}
                size="small"
                fillStyle="ghost"
                intent="secondary"
                onClick={onClick}
                isDisabled={isDisabled}
            >
                check_circle
            </IconButton>
            <Tooltip target={ref}>Close tickets</Tooltip>
        </>
    )
}
