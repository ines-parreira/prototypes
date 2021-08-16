import React, {ReactNode} from 'react'
import {Link} from 'react-router-dom'

import {ViewFilter} from '../../../state/views/types'

import css from './StatViewLink.less'

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

export default function StatViewLink({viewName, filters, children}: Props) {
    const expression = filters.map(buildRawCallExpression).join(' && ')

    return (
        <Link
            className={css.searchLink}
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
