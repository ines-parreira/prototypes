import React, {SVGProps} from 'react'
import classnames from 'classnames'

import css from './Spinner.less'

type Props = {
    color?: 'light' | 'gloom' | 'dark'
} & SVGProps<SVGSVGElement>

const Spinner = ({className, color = 'light', ...props}: Props) => {
    return (
        <svg
            className={classnames(css.spinner, css[color], className)}
            width="100%"
            viewBox="0 0 20 20"
            preserveAspectRatio="xMidYMid meet"
            role="status"
            {...props}
        >
            <circle
                className={css.dot}
                cx="10"
                cy="10"
                r="6"
                fill="none"
                strokeWidth="2"
            />
            <circle
                className={css.circle}
                cx="10"
                cy="10"
                r="6"
                fill="none"
                strokeWidth="2"
            />
            <span className="sr-only">Loading...</span>
        </svg>
    )
}

export default Spinner
