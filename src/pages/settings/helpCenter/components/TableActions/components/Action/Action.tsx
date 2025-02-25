import React from 'react'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import IconButton from 'pages/common/components/button/IconButton'

export type ActionSchema<TName extends string = string> = {
    icon: string
    name: TName
    tooltip?: {
        content: string | React.ReactNode
        target: string
    }
    disabled?: boolean
}

type ActionProps<TName extends string> = ActionSchema<TName> & {
    onClick: (ev: React.MouseEvent<HTMLSpanElement>, name: TName) => void
}

export function Action<TName extends string>({
    icon,
    name,
    tooltip,
    disabled,
    onClick,
}: ActionProps<TName>): JSX.Element {
    return (
        <>
            <IconButton
                id={tooltip?.target}
                isDisabled={disabled}
                onClick={(ev) => onClick(ev, name)}
                intent="secondary"
                fillStyle="ghost"
                aria-label={name}
            >
                {icon}
            </IconButton>
            {tooltip && (
                <Tooltip placement="top-end" target={tooltip.target}>
                    {tooltip.content}
                </Tooltip>
            )}
        </>
    )
}
