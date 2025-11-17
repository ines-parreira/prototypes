import type { QueryKey } from '@tanstack/react-query'

import * as constants from './constants'

export const updateQueryTimestamp = (queryKey: QueryKey) => ({
    type: constants.UPDATE_QUERY_TIMESTAMP,
    queryKey: JSON.stringify(queryKey),
})
