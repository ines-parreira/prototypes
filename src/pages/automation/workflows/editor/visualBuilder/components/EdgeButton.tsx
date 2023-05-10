import React from 'react'
import classnames from 'classnames'
import BaseEdgeButton, {BaseEdgeButtonProps} from './BaseEdgeButton'

import css from './EdgeButton.less'

type Props = {
    icon?: string
} & BaseEdgeButtonProps

const EdgeButton = ({icon, children, ...props}: Props) => {
    return (
        <BaseEdgeButton {...props}>
            <span className={css.wrapper}>
                {icon && (
                    <i className={classnames('material-icons', css.icon)}>
                        {icon}
                    </i>
                )}
                {children}
            </span>
        </BaseEdgeButton>
    )
}

export default EdgeButton
