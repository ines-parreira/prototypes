import React, {SVGProps} from 'react'
import classnames from 'classnames'

import css from './Spinner.less'

type Props = {
    color?: 'light' | 'gloom' | 'dark'
} & SVGProps<SVGSVGElement> &
    XOR<
        Required<Pick<SVGProps<SVGSVGElement>, 'width'>> & {
            size: 'small' | 'medium' | 'big'
        }
    >

const Spinner = ({
    className,
    color = 'gloom',
    size,
    width,
    ...props
}: Props) => {
    return (
        <svg
            className={classnames(
                css.spinner,
                css[color],
                size && css[size],
                className
            )}
            viewBox="0 0 20 20"
            preserveAspectRatio="xMidYMid meet"
            role="status"
            width={width}
            height={width}
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
