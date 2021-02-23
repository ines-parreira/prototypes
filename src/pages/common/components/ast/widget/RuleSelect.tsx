import classnames from 'classnames'
import React, {ReactNode} from 'react'
import {
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap'

import css from './RuleSelect.less'

type Props = {
    children?: ReactNode | null
    className?: string
    placeholder?: string
    valueLabel: ReactNode | string | null
}

export default function RuleSelect({
    children,
    className,
    placeholder = 'Select an option',
    valueLabel,
}: Props) {
    return (
        <div className={classnames(css.wrapper, className, 'test')}>
            <UncontrolledButtonDropdown>
                <DropdownToggle
                    className={classnames(
                        css.select,
                        'ControlStructureButton dropdown-toggle'
                    )}
                    type="button"
                >
                    <span className={css.label}>
                        {valueLabel || placeholder}
                    </span>
                </DropdownToggle>
                <DropdownMenu className={css.options}>{children}</DropdownMenu>
            </UncontrolledButtonDropdown>
        </div>
    )
}

type OptionProps = {
    children: ReactNode
    onClick: () => void
    value: string | number
    toggle?: boolean
}

export function Option({children, onClick, value, toggle = true}: OptionProps) {
    return (
        <DropdownItem
            className={classnames(css.option)}
            key={value}
            onClick={onClick}
            toggle={toggle}
            type="button"
        >
            {children}
        </DropdownItem>
    )
}
Option.displayName = 'RuleSelect.Option'
RuleSelect.Option = Option
