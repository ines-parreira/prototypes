import React, {ReactNode} from 'react'
import {Link} from 'react-router-dom'

import {ViewFilter} from '../../../state/views/types'

import css from './ViewLink.less'

type Props = {
    viewName: string
    filters: ViewFilter[]
    children: ReactNode
}

function buildRawCallExpression(filter: ViewFilter) {
    if (filter.right == null) {
        return `${filter.operator}(${filter.left})`
    }
    return `${filter.operator}(${filter.left}, ${filter.right})`
}

export default function ViewLink({viewName, filters, children}: Props) {
    const expression = filters.map(buildRawCallExpression).join(' && ')

    return (
        <Link
            className={css.viewLink}
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
