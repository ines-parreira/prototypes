import classNames from 'classnames'
import React, {ReactNode} from 'react'
import {DropdownItem} from 'reactstrap'

import css from './MenuItem.less'

type Props = {
    isActive: boolean
    isDeprecated?: boolean
    children?: ReactNode
    onActivate: () => void
    onSelect: () => void
}

export default function MenuItem({
    isActive,
    isDeprecated,
    children,
    onActivate,
    onSelect,
}: Props) {
    return (
        <DropdownItem
            type="button"
            className={classNames(css.option, {
                [`${css['option--focused']}`]: isActive,
                [css.optionDeprecated]: isDeprecated,
            })}
            onMouseEnter={onActivate}
            onMouseDown={(event) => {
                event.stopPropagation()
                event.preventDefault()
                onSelect()
            }}
        >
            {isDeprecated && (
                <span className="material-icons mr-1">warning</span>
            )}
            <span>{children}</span>
            {isDeprecated && <span className="ml-1">{'(deprecated)'}</span>}
        </DropdownItem>
    )
}
