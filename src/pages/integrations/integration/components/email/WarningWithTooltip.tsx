import React, {ReactNode} from 'react'
import Tooltip from 'pages/common/components/Tooltip'

type Props = {
    children: ReactNode
    id: string
}

export default function WarningWithTooltip({children, id}: Props) {
    return (
        <>
            <span id={id}>
                <i className="material-icons align-middle orange md-2">
                    warning
                </i>
            </span>
            <Tooltip placement="top-end" target={id}>
                {children}
            </Tooltip>
        </>
    )
}
