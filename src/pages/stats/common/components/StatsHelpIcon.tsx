import classNames from 'classnames'
import React, {forwardRef, HTMLProps} from 'react'

import css from './StatsHelpIcon.less'

const StatsHelpIcon = forwardRef<HTMLElement, HTMLProps<HTMLElement>>(
    (props: HTMLProps<HTMLElement>, ref) => {
        return (
            <i
                {...props}
                ref={ref}
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
)

export default StatsHelpIcon
