import React, {HTMLAttributes} from 'react'
import _capitalize from 'lodash/capitalize'
import classnames from 'classnames'

import css from './IconInput.less'

type Props = {
    className?: string
    icon: string
    position?: 'left' | 'right'
} & HTMLAttributes<HTMLElement>

const IconInput = ({className, icon, position, ...props}: Props) => (
    <i
        className={classnames(
            'material-icons',
            css.icon,
            position && css[`icon${_capitalize(position)}`],
            className
        )}
        {...props}
    >
        {icon}
    </i>
)

export default IconInput
