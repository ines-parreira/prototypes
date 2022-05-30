import client from 'models/api/resources'

import {
    SearchResponse,
    SearchParams,
    SearchEngine,
    SearchApiResponse,
} from 'models/search/types'

export const SEARCH_ENDPOINT = '/api/search/'
export const SEARCH_ENGINE_HEADER = 'x-gorgias-search-engine'

export const search = async <T>({
    query,
    type,
    cancelToken,
}: SearchParams): Promise<SearchResponse<T>> => {
    const res = await client.post<SearchApiResponse<T>>(
        SEARCH_ENDPOINT,
        {
            type,
            query,
        },
        {cancelToken}
    )
    const result: SearchResponse<T> = {...res.data}
    const headers = res.headers as
        | Record<typeof SEARCH_ENGINE_HEADER, SearchEngine>
        | undefined
    if (headers) {
        result.searchEngine = headers[SEARCH_ENGINE_HEADER]
    }
    return result
}
