import React, {MouseEvent, ReactNode} from 'react'
import classnames from 'classnames'

import ToggleInput from 'pages/common/forms/ToggleInput'

import css from './OrderManagementFlowItem.less'

type Props = {
    isEnabled: boolean
    isDisabled?: boolean
    title: ReactNode
    description: ReactNode
    action?: ReactNode
    onChange: (isEnabled: boolean) => void
    onClick?: () => void
    onMouseEnter?: () => void
    onMouseLeave?: () => void
}

const DEFAULT_ACTION = (
    <i className={classnames('material-icons', css.defaultAction)}>
        keyboard_arrow_right
    </i>
)

const OrderManagementFlowItem = ({
    isEnabled,
    isDisabled,
    title,
    description,
    action = DEFAULT_ACTION,
    onChange,
    onClick,
    onMouseEnter,
    onMouseLeave,
}: Props) => {
    const handleChange = (
        nextValue: boolean,
        event: MouseEvent<HTMLLabelElement>
    ) => {
        event.preventDefault()

        onChange(nextValue)
    }

    return (
        <div
            className={classnames(css.container, {
                [css.isClickable]: Boolean(onClick),
            })}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <ToggleInput
                isToggled={isEnabled}
                isDisabled={isDisabled}
                onClick={handleChange}
            />
            <div>
                <div className={css.title}>{title}</div>
                <div className={css.description}>{description}</div>
            </div>
            <div className={css.action}>{action}</div>
        </div>
    )
}

export default OrderManagementFlowItem
