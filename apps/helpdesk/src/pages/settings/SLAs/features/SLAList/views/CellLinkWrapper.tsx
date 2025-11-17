import type { ComponentProps, ReactNode } from 'react'
import React from 'react'

import { Link } from 'react-router-dom'

import css from './CellLinkWrapper.less'

type CellLinkWrapperProps = { children: ReactNode } & ComponentProps<
    typeof Link
>
export default function CellLinkWrapper({
    children,
    ...linkProps
}: CellLinkWrapperProps) {
    return (
        <Link className={css.link} {...linkProps}>
            {children}
        </Link>
    )
}
