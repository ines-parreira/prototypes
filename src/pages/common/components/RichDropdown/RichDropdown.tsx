import classnames from 'classnames'
import React, {ReactNode} from 'react'
import {
    DropdownMenu,
    DropdownToggle,
    UncontrolledButtonDropdown,
} from 'reactstrap'
import _identity from 'lodash/identity'

import css from './RichDropdown.less'
import RichDropdownOptionGroups from './RichDropdownOptionGroups'
import RichDropdownOptions from './RichDropdownOptions'
import {Option, OptionGroup, isOptionGroupArray} from './types'

type OptionProps = {
    options: Option[] | OptionGroup[]
    onClick: (optionKey: string) => void
}

type Props = OptionProps & {
    children?: ReactNode
    className?: string
    renderMenuItems?: (menuItems: ReactNode) => ReactNode
    renderOption?: (props: OptionProps) => ReactNode
    value: string
}

export default function RichDropdown({
    children,
    className,
    renderMenuItems = _identity,
    renderOption = renderOptionDefault,
    value,
    ...optionProps
}: Props) {
    return (
        <div className={classnames(className)}>
            {children}
            <UncontrolledButtonDropdown>
                <DropdownToggle caret>{value}</DropdownToggle>
                <DropdownMenu className={css.dropdown}>
                    {renderMenuItems(renderOption(optionProps))}
                </DropdownMenu>
            </UncontrolledButtonDropdown>
        </div>
    )
}

function renderOptionDefault({options, onClick}: OptionProps) {
    return options.length > 0 && isOptionGroupArray(options) ? (
        <RichDropdownOptionGroups onClick={onClick} options={options} />
    ) : (
        <RichDropdownOptions onClick={onClick} options={options} />
    )
}
