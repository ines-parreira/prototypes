import classNames from 'classnames'
import React, {ReactNode} from 'react'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from 'reactstrap'

import css from './FieldMappingSelectorDropdown.less'

import {Option} from './types'

export interface Props {
    className?: string
    label?: string | ReactNode
    options: Option[]
    selectedOption: Option | undefined
    onClick: (optionKey: string) => void
}

export default function FieldMappingSelectorDropdown({
    className,
    onClick,
    options,
    selectedOption,
}: Props): JSX.Element {
    return (
        <div className={classNames(css['selector'], className)}>
            <UncontrolledDropdown>
                <DropdownToggle className={css['selector-button']} caret>
                    <div className={css['selector-button-inner']}>
                        {selectedOption?.label ?? (
                            <span className={css['placeholder']}>
                                Select a header...
                            </span>
                        )}
                    </div>
                </DropdownToggle>

                <DropdownMenu className={css['dropdown']}>
                    {options.map(({key, label}) => (
                        <DropdownItem
                            key={key}
                            onClick={() => onClick(key)}
                            type="button"
                        >
                            <span>
                                {key === selectedOption?.key ? (
                                    <i
                                        className={classNames(
                                            'material-icons',
                                            css['selected-mark']
                                        )}
                                    >
                                        check
                                    </i>
                                ) : null}
                                {label}
                            </span>
                        </DropdownItem>
                    ))}
                </DropdownMenu>
            </UncontrolledDropdown>
        </div>
    )
}
