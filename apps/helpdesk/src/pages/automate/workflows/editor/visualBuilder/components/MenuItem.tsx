import React, { ReactNode, useState } from 'react'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownItemLabel from 'pages/common/components/dropdown/DropdownItemLabel'

type Props = {
    label: string
    description?: string
    icon: ReactNode
    onClick: () => void
    disabledText?: string
    floatingRef?: HTMLElement | null
}

const MenuItem = ({
    label,
    onClick,
    disabledText,
    icon,
    description,
    floatingRef,
}: Props) => {
    const [ref, setRef] = useState<HTMLElement | null>(null)

    const isDisabled = !!disabledText

    return (
        <DropdownItem
            ref={setRef}
            option={{
                label,
                value: label,
            }}
            onClick={onClick}
            isDisabled={isDisabled}
            shouldCloseOnSelect
        >
            <DropdownItemLabel
                prefix={icon}
                caption={description}
                isDisabled={isDisabled}
            >
                {label}
            </DropdownItemLabel>
            {disabledText && floatingRef && ref && (
                <Tooltip
                    placement="top-start"
                    target={ref}
                    container={floatingRef}
                >
                    {disabledText}
                </Tooltip>
            )}
        </DropdownItem>
    )
}

export default MenuItem
