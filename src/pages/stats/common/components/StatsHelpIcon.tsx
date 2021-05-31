import React, {HTMLProps} from 'react'
import classNames from 'classnames'

import css from './StatsHelpIcon.less'

export default function StatsHelpIcon(props: HTMLProps<HTMLElement>) {
    return (
        <i
            {...props}
            className={classNames(
                'material-icons ml-2',
                css.helpIcon,
                props.className
            )}
        >
            info_outline
        </i>
    )
}
