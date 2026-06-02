import { useMemo } from 'react'

import { useShortcuts } from '@repo/utils'

import { useDataTable, useDataTableConfig } from '@gorgias/axiom'

type Props = {
    isLoading: boolean
}

export function TicketTablePaginationShortcuts({ isLoading }: Props) {
    const table = useDataTable()
    const { pagination } = useDataTableConfig()
    const hasNextPage = Boolean(pagination?.hasNextPage)
    const hasPreviousPage = Boolean(pagination?.hasPreviousPage)
    const onPageChange = pagination?.onPageChange

    const actions = useMemo(
        () => ({
            GO_NEXT_PAGE: {
                action: (event: Event) => {
                    if (isLoading || !hasNextPage) {
                        return
                    }

                    event.preventDefault?.()
                    onPageChange?.('next')
                    table.nextPage()
                },
            },
            GO_PREV_PAGE: {
                action: (event: Event) => {
                    if (isLoading || !hasPreviousPage) {
                        return
                    }

                    event.preventDefault?.()
                    onPageChange?.('previous')
                    table.previousPage()
                },
            },
        }),
        [hasNextPage, hasPreviousPage, isLoading, onPageChange, table],
    )

    useShortcuts('View', actions)

    return null
}
