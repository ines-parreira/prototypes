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

type ViewLinkTo = {
    pathname: string
    state: { viewName: string; filters: string }
}

/**
 * Builds the react-router `to` target for a filtered tickets view. Exported so
 * non-anchor triggers (e.g. an axiom `Button as={Link}`) can navigate to the
 * same view without re-implementing the filter-expression serialization.
 */
export function buildViewLinkTo(
    viewName: string,
    filters: ViewFilter[],
): ViewLinkTo {
    return {
        pathname: '/app/tickets/new/public',
        state: {
            viewName,
            filters: filters.map(buildRawCallExpression).join(' && '),
        },
    }
}

export function ViewLink({
    viewName,
    filters,
    children,
    className,
    ...anchorProps
}: Props) {
    return (
        <Link
            {...anchorProps}
            className={classNames(css.viewLink, className)}
            to={buildViewLinkTo(viewName, filters)}
        >
            {children}
        </Link>
    )
}
