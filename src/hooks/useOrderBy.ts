import {useCallback, useState} from 'react'

import {OrderDirection} from 'models/api/types'

export default function useOrderBy<T extends string>(
    defaultOrderBy?: T,
    defaultOrderDirection: OrderDirection = OrderDirection.Asc
) {
    const [orderBy, setOrderBy] = useState<T | undefined>(defaultOrderBy)
    const [orderDirection, setOrderDirection] = useState<OrderDirection>(
        defaultOrderDirection
    )

    const toggleOrderBy = useCallback(
        (column: T) => {
            if (orderBy === column) {
                setOrderDirection((oldDirection) =>
                    oldDirection === OrderDirection.Asc
                        ? OrderDirection.Desc
                        : OrderDirection.Asc
                )
            } else {
                setOrderBy(column)
                setOrderDirection(OrderDirection.Asc)
            }
        },
        [setOrderBy, setOrderDirection, orderBy]
    )

    const orderParam: `${T}:${OrderDirection}` | null = orderBy
        ? `${orderBy}:${orderDirection}`
        : null

    return {
        orderBy,
        orderDirection,
        orderParam,
        toggleOrderBy,
    }
}
