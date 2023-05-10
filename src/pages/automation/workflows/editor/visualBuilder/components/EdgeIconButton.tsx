import React, {forwardRef} from 'react'
import classnames from 'classnames'
import BaseEdgeButton, {BaseEdgeButtonProps} from './BaseEdgeButton'

import css from './EdgeIconButton.less'

type Props = {
    icon: string
} & Omit<BaseEdgeButtonProps, 'children'>

const EdgeIconButton = forwardRef<HTMLDivElement, Props>(
    ({icon, ...props}, ref) => {
        return (
            <BaseEdgeButton ref={ref} {...props}>
                <i className={classnames('material-icons', css.icon)}>{icon}</i>
            </BaseEdgeButton>
        )
    }
)

export default EdgeIconButton
