import React, {ReactNode} from 'react'
import classnames from 'classnames'

import type {Option} from '../../../../../common/components/RichDropdown/types'

import css from './DropdownOptionItem.less'

type Props = {
    option: Option
    disabled?: boolean
    hoverable?: boolean
    onClick?: () => void
    renderAction?: () => ReactNode
}

export const DropdownOptionItem = ({
    option,
    disabled = false,
    hoverable = false,
    onClick = () => null,
    renderAction = () => null,
}: Props) => {
    const {label, key, description} = option
    return (
        <div
            key={key}
            className={classnames(css.dropdownItemWrapper, {
                [css.disabled]: disabled,
                [css.hoverable]: hoverable,
            })}
            onClick={onClick}
        >
            <div className={css.dropdownItemLabel}>
                <span className={css.action}>{renderAction()}</span>
                <span className={css.label}>{label}</span>
            </div>
            {description && (
                <div className={css.description} title={description}>
                    {description}
                </div>
            )}
        </div>
    )
}
