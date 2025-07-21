import React, { ReactNode } from 'react'

import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownItemLabel from 'pages/common/components/dropdown/DropdownItemLabel'

type Props = {
    label: string
    icon: ReactNode
    onClick: () => void
}

const MenuCategoryItem = ({ label, onClick, icon }: Props) => {
    return (
        <DropdownItem
            option={{
                label,
                value: label,
            }}
            onClick={onClick}
        >
            <DropdownItemLabel
                prefix={icon}
                suffix={<i className="material-icons">chevron_right</i>}
            >
                {label}
            </DropdownItemLabel>
        </DropdownItem>
    )
}

export default MenuCategoryItem
