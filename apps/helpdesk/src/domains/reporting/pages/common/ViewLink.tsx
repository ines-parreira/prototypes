import type { HTMLAttributes, ReactNode } from 'react'
import React from 'react'

import classNames from 'classnames'
import { Link } from 'react-router-dom'

import css from 'domains/reporting/pages/common/ViewLink.less'
import type { ViewFilter } from 'state/views/types'

type Props = {
    viewName: string
    filters: ViewFilter[]
    children: ReactNode
} & HTMLAttributes<HTMLAnchorElement>

function buildRawCallExpression(filter: ViewFilter) {
    if (filter.right == null) {
        return `${filter.operator}(${filter.left})`
    }
    return `${filter.operator}(${filter.left}, ${filter.right})`
}

export default function ViewLink({
    viewName,
    filters,
    children,
    className,
    ...anchorProps
}: Props) {
    const expression = filters.map(buildRawCallExpression).join(' && ')

    return (
        <Link
            {...anchorProps}
            className={classNames(css.viewLink, className)}
            to={{
                pathname: '/app/tickets/new/public',
                state: {
                    viewName,
                    filters: expression,
                },
            }}
        >
            {children}
        </Link>
    )
}
