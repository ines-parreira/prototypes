import React, {HTMLProps, ReactNode} from 'react'
import {Link} from 'react-router-dom'

import css from './ArrowLink.less'

type Props = {
    children: ReactNode
    className?: string
} & HTMLProps<HTMLAnchorElement>

export default function ArrowLink({
    className,
    children,
    href,
    ref,
    ...props
}: Props) {
    const arrow = (
        <span className={`material-icons ${css.arrow}`}>arrow_forward</span>
    )
    const classnames = `${css.link} ${className || ''}`

    if (href?.startsWith('/') || href?.startsWith('?')) {
        return (
            <Link className={classnames} to={href} role="link" {...props}>
                {children}
                {arrow}
            </Link>
        )
    }

    return (
        <a className={classnames} href={href} ref={ref} {...props}>
            {children}
            {arrow}
        </a>
    )
}
