import React, { useMemo } from 'react'
import type { ComponentProps } from 'react'

import cn from 'classnames'
import { Link, useLocation } from 'react-router-dom'

import css from './NavbarLink.less'

type NavbarLinkProps = {
    className?: string
    to: string
} & ComponentProps<typeof Link>

export default function NavbarLink({ className, ...props }: NavbarLinkProps) {
    const { pathname: path } = useLocation()

    const current = useMemo(
        () =>
            path.includes(
                props.to.endsWith('s') ? props.to.slice(0, -1) : props.to,
            ),
        [path, props.to],
    )

    return (
        <Link {...props} className={cn(css.menuItem, className, { current })} />
    )
}
