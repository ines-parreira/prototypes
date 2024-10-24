import classnames from 'classnames'
import React, {HTMLAttributes} from 'react'

import css from './IconInput.less'

type Props = {
    className?: string
    icon: string
} & HTMLAttributes<HTMLElement>

const IconInput = ({className, icon, ...props}: Props) => (
    <i className={classnames('material-icons', css.icon, className)} {...props}>
        {icon}
    </i>
)

export default IconInput
