import classnames from 'classnames'
import React, {HTMLAttributes} from 'react'

import css from 'pages/common/forms/input/IconInput.less'

type Props = {
    className?: string
    icon: string
    isOutlined?: boolean
} & HTMLAttributes<HTMLElement>

const IconInput = ({className, icon, isOutlined = false, ...props}: Props) => (
    <i
        className={classnames(
            isOutlined ? 'material-icons-outlined' : 'material-icons',
            css.icon,
            className
        )}
        {...props}
    >
        {icon}
    </i>
)

export default IconInput
