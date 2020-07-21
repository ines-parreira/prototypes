//@flow
import type {Node as ReactNode} from 'react'
import classnames from 'classnames'
import React from 'react'
import {
    DropdownMenu,
    DropdownToggle,
    UncontrolledButtonDropdown,
} from 'reactstrap'
import _identity from 'lodash/identity'

import css from './RichDropdown.less'
import RichDropdownOptionGroups from './RichDropdownOptionGroups'
import RichDropdownOptions from './RichDropdownOptions'
import type {Option, OptionGroup} from './types'

type OptionProps = {
    options: Option[] | OptionGroup[],
    onClick: (optionKey: string) => void,
}

type Props = OptionProps & {
    children?: ReactNode,
    className?: string,
    renderMenuItems?: (menuItems: ReactNode) => ReactNode,
    renderOption?: (props: OptionProps) => ReactNode,
    value: string,
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
    return options.length > 0 && options[0].options ? (
        <RichDropdownOptionGroups onClick={onClick} options={(options: any)} />
    ) : (
        <RichDropdownOptions onClick={onClick} options={(options: any)} />
    )
}
