import { useQuery } from '@tanstack/react-query'

import { data } from '../MetafieldsTable/data'

export const METAFIELDS_QUERY_KEY = ['metafields']

export function useMetafields() {
    return useQuery({
        queryKey: METAFIELDS_QUERY_KEY,
        queryFn: () => Promise.resolve(data),
        staleTime: Infinity,
    })
}
