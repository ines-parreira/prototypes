import type { HTMLProps } from 'react'
import { forwardRef } from 'react'

import classNames from 'classnames'

import css from 'domains/reporting/pages/common/components/StatsHelpIcon.less'

const StatsHelpIcon = forwardRef<HTMLElement, HTMLProps<HTMLElement>>(
    (props: HTMLProps<HTMLElement>, ref) => {
        return (
            <i
                {...props}
                ref={ref}
                className={classNames(
                    'material-icons ml-2',
                    css.helpIcon,
                    props.className,
                )}
            >
                info_outline
            </i>
        )
    },
)

export default StatsHelpIcon
