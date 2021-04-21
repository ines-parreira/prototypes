import {Tooltip} from 'reactstrap'
import React, {ReactNode, useState} from 'react'

type Props = {
    id: string
    tooltipContainer: string
    message: string
    children: ReactNode
    show?: boolean
}

export const TooltipWrapper = ({
    id,
    tooltipContainer,
    message,
    children,
    show = true,
}: Props) => {
    const [isOpen, setOpen] = useState(false)
    return (
        <>
            {show && (
                <Tooltip
                    isOpen={isOpen}
                    toggle={() => setOpen(!isOpen)}
                    target={id}
                    container={tooltipContainer}
                >
                    {message}
                </Tooltip>
            )}
            <span id={id}>{children}</span>
        </>
    )
}
