import {useMemo} from 'react'
import {OrderDirection} from 'models/api/types'

import {getDataFromTableCell} from '../utils/getDataFromTableCell'

import {
    CampaignTableKeys,
    isCampaignTableKey,
} from '../types/enums/CampaignTableKeys.enum'
import {CampaignTableContentCell} from '../types/CampaignTableContentCell'

type Options = {
    offset: number
    page: number
    orderKey?: CampaignTableKeys
    orderDirection: OrderDirection
}

export function useSortedAndPaginatedTableRows(
    rows: CampaignTableContentCell[],
    options: Options
) {
    const sortedRows = useMemo(() => {
        if (options.orderKey && isCampaignTableKey(options.orderKey)) {
            const sortedRows = [...rows].sort((a, b) => {
                let aValue = getDataFromTableCell(
                    a,
                    options.orderKey as CampaignTableKeys
                )
                let bValue = getDataFromTableCell(
                    b,
                    options.orderKey as CampaignTableKeys
                )

                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase()
                }

                if (typeof bValue === 'string') {
                    bValue = bValue.toLowerCase()
                }

                if (aValue < bValue) {
                    return options.orderDirection === 'asc' ? -1 : 1
                }

                if (aValue > bValue) {
                    return options.orderDirection === 'asc' ? 1 : -1
                }

                return 0
            })

            return sortedRows
        }
        return rows
    }, [rows, options.orderKey, options.orderDirection])

    const paginatedRows = useMemo(() => {
        if (options.offset + options.page >= sortedRows.length) {
            return sortedRows.slice(options.offset)
        }

        return sortedRows.slice(options.offset, options.offset + options.page)
    }, [sortedRows, options.page, options.offset])

    return paginatedRows
}
